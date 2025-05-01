import {bucketType, createPresignedUrlWithClient, put_buffer} from "@/lib/aws";
import {NextResponse} from "next/server";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export async function OPTIONS() {
    return NextResponse.json({}, {
      headers: {
        'Access-Control-Allow-Origin': 'http://84.201.129.122',
        'Access-Control-Allow-Methods': 'PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

export async function PUT(req: Request) {
    const headers = {
      'Access-Control-Allow-Origin': 'http://84.201.129.122',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
  
    try {
      const formData = await req.formData();
  
      const bucketName = formData.get("type");
      if (!bucketName || (bucketName !== "match-photos" && bucketName !== "stadium-schemes")) {
        return NextResponse.json(
          { msg: "type может быть равен только match-photos или stadium-schemes" },
          { status: 400, headers }
        );
      }
  
      const match_id = formData.get("match_id");
      if (!match_id) {
        return NextResponse.json({ msg: "Вы не указали match_id" }, { status: 400, headers });
      }
  
      const imageFile = formData.get("image");
      if (!imageFile) {
        return NextResponse.json({ msg: "Вы не прикрепили файл image в форму" }, { status: 400, headers });
      }
  
      // Получаем Buffer из Blob (вместо проверки на File)
      let fileBuffer: Buffer;
      if (imageFile instanceof Blob) {
        fileBuffer = Buffer.from(await imageFile.arrayBuffer());
      } else if (typeof imageFile === "string") {
        fileBuffer = Buffer.from(imageFile);
      } else {
        return NextResponse.json({ msg: "Неподдерживаемый формат файла" }, { status: 400, headers });
      }
  
      const bucketInfo: bucketType = {
        bucketName: bucketName.toString(),
        region: "us-east-1",
        key: `matches/${match_id.toString()}`,
      };
  
      const clientUrl = await createPresignedUrlWithClient(bucketInfo);
      await put_buffer(clientUrl, fileBuffer, imageFile.type?.toString() || "application/octet-stream");
  
      return NextResponse.json({ msg: "Вы успешно загрузили файл" }, { headers });
    } catch (e: any) {
      console.error(e);
      return NextResponse.json({ msg: `Ошибка: ${e.message}` }, { status: 500, headers });
    }
  }