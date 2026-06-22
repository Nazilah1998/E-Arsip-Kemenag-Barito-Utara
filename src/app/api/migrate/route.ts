import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function GET() {
  try {
    // 1. Inisialisasi Supabase dengan Service Role Key (Admin) agar bisa membaca semua file
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      db: { schema: 'kemenag_arsip' }
    });

    // 2. Inisialisasi Cloudflare R2 Client
    const accountId = process.env.R2_ACCOUNT_ID!;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;
    const bucketName = process.env.R2_BUCKET_NAME || "e-arsip-betang";

    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    // 3. Ambil semua data file yang belum dihapus dari database
    const { data: files, error: dbError } = await supabaseAdmin
      .from("files")
      .select("*")
      .is("deleted_at", null);

    if (dbError) throw dbError;
    if (!files || files.length === 0) {
      return NextResponse.json({ message: "Tidak ada file yang perlu dimigrasi." });
    }

    const oldBucket = "Files-arsip";
    const results = [];

    // 4. Pindahkan setiap file
    for (const file of files) {
      if (!file.r2_object_key) {
        results.push({ id: file.id, name: file.name, status: "skipped - no key" });
        continue;
      }

      try {
        // A. Unduh dari Supabase Storage
        const { data: fileBlob, error: downloadError } = await supabaseAdmin.storage
          .from(oldBucket)
          .download(file.r2_object_key);

        if (downloadError) throw downloadError;
        if (!fileBlob) throw new Error("File kosong/tidak ditemukan di Supabase");

        const arrayBuffer = await fileBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // B. Unggah ke Cloudflare R2 dengan nama & struktur yang persis sama
        const uploadCommand = new PutObjectCommand({
          Bucket: bucketName,
          Key: file.r2_object_key,
          Body: buffer,
          ContentType: file.mime_type || "application/octet-stream",
        });

        await s3Client.send(uploadCommand);
        results.push({ id: file.id, name: file.name, status: "success" });
      } catch (err) {
        console.error(`Gagal memigrasi ${file.name}:`, err);
        results.push({ id: file.id, name: file.name, status: "error", error: String(err) });
      }
    }

    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    return NextResponse.json({
      message: "Proses migrasi selesai",
      total_files_in_db: files.length,
      success_count: successCount,
      error_count: errorCount,
      details: results
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
