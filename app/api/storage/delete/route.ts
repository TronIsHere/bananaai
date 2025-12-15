import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";

export async function DELETE(req: Request) {
  try {
    const { key } = await req.json();

    if (!key) {
      return Response.json({ error: "Key is required" }, { status: 400 });
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.LIARA_BUCKET_NAME,
      Key: key,
    });

    await s3.send(command);

    return Response.json({ message: "File deleted" });
  } catch (error: any) {
    console.error("Error deleting file from storage:", error);
    return Response.json(
      { error: "Failed to delete file", message: error.message },
      { status: 500 }
    );
  }
}






