from fastapi import APIRouter
from pydantic import BaseModel
import json, csv, io, base64, urllib.parse, os
import anthropic

router = APIRouter()
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

class TransformInput(BaseModel):
    content: str
    transform: str

@router.post("/transform")
def transform_content(body: TransformInput):
    c = body.content.strip()
    t = body.transform

    if t == "prettify":
        try:
            return {"result": json.dumps(json.loads(c), indent=2)}
        except:
            return {"result": c}

    elif t == "minify":
        try:
            return {"result": json.dumps(json.loads(c), separators=(',', ':'))}
        except:
            return {"result": " ".join(c.split())}

    elif t == "json_to_csv":
        try:
            data = json.loads(c)
            if isinstance(data, list) and data:
                output = io.StringIO()
                writer = csv.DictWriter(output, fieldnames=data[0].keys())
                writer.writeheader()
                writer.writerows(data)
                return {"result": output.getvalue()}
        except:
            pass
        return {"result": "Could not convert to CSV"}

    elif t == "base64_encode":
        return {"result": base64.b64encode(c.encode()).decode()}

    elif t == "base64_decode":
        try:
            return {"result": base64.b64decode(c).decode()}
        except:
            return {"result": "Invalid base64"}

    elif t == "url_encode":
        return {"result": urllib.parse.quote(c)}

    elif t == "url_decode":
        return {"result": urllib.parse.unquote(c)}

    elif t == "explain":
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[{"role": "user", "content": f"Explain this concisely in 3-5 sentences for a developer:\n\n{c}"}]
        )
        return {"result": message.content[0].text}

    return {"result": "Unknown transform"}