from pydantic import BaseModel

class ImageData(BaseModel):
    id: str
    filename: str
    path: str
