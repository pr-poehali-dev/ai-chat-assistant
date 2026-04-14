import json
import os
import openai


def handler(event: dict, context) -> dict:
    """Отправляет сообщение в Yandex AI и возвращает ответ ИИ-ассистента."""

    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400",
            },
            "body": "",
        }

    body = json.loads(event.get("body") or "{}")
    message = body.get("message", "")
    system_prompt = body.get("systemPrompt", "Ты полезный ИИ-ассистент. Отвечай по-русски.")

    if not message:
        return {
            "statusCode": 400,
            "headers": {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"},
            "body": {"error": "Сообщение не передано"},
        }

    client = openai.OpenAI(
        api_key=os.environ["YANDEX_AI_API_KEY"],
        base_url="https://ai.api.cloud.yandex.net/v1",
        project="b1gpk514vvrdsgeblaht",
    )

    response = client.responses.create(
        prompt={
            "id": "fvtuq98dmcf182elo44t",
        },
        input=message,
    )

    reply = response.output_text

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"},
        "body": {"reply": reply},
    }