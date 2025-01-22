from pydantic import BaseModel, EmailStr


class SendModel(BaseModel):
    """
    Pydantic-модель для валидации запроса на отправку письма.
    """
    receiver: EmailStr 
    subject: str
    title: str
    code_type: str
    body: str