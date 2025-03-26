import {bucketType, createPresignedUrlWithClient, put_buffer} from "@/lib/aws";
import {NextResponse} from "next/server";

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function PUT(req: Request) {
    try {
        const formData = await req.formData();

        const bucketName = formData.get("type");
        if (!bucketName || (bucketName !== "match-photos" && bucketName !== "stadium-schemes")) {
            return NextResponse.json(
                { msg: "type может быть равен только match-photos или stadium-schemes" },
                { status: 400 }
            );
        }

        const match_id = formData.get("match_id");
        if (!match_id) {
            return NextResponse.json({ msg: "Вы не указали match_id" }, { status: 400 });
        }


        const imageFile = formData.get("image");
        if (!imageFile || !(imageFile instanceof File)) {
            return NextResponse.json({ msg: "Вы не прикрепили файл image в форму" }, { status: 400 });

        }
        const fileBuffer = await imageFile.arrayBuffer();
        const fileContent = Buffer.from(fileBuffer);
        const mimeType = imageFile.type;

        const bucketInfo : bucketType = {
            bucketName,
            region: "us-east-1",
            key: `matches/${match_id}`,
        }

        const clientUrl = await createPresignedUrlWithClient(bucketInfo);

        await put_buffer(clientUrl, fileContent, mimeType);

        return NextResponse.json({ msg: "Вы успешно загрузили файл" });
    } catch (e : any) {
        console.error(e);
        return NextResponse.json({ msg: `Ошибка: ${e.message}` }, { status: 500 });
    }
}

