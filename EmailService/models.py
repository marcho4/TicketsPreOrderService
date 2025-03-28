import enum
import logging
from typing import Dict, Optional, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

logger = logging.getLogger("email-service.sender")


class TemplateId(str, enum.Enum):
    REGISTRATION_SUCCESS = "registration-success"
    ORGANIZER_APPROVAL = "organizer-approval"
    TICKET_PREORDER_SUCCESS = "ticket-preorder-success"
    TICKET_PREORDER_CANCEL = "ticket-preorder-cancel"
    MATCH_DETAILS_CHANGE = "match-details-change"
    ORG_REGISTRATION = "org-registration"
    AUTO_PREORDER_SUCCESS = "auto-preorder-success"


class Recipient(BaseModel):
    email: EmailStr
    name: str


class EmailMetadata(BaseModel):
    priority: str = Field(
        default="normal",
        description="Приоритет отправки: high, normal, low"
    )
    tracking_id: Optional[str] = Field(
        default=None,
        description="Уникальный идентификатор для отслеживания"
    )
    send_at: Optional[datetime] = Field(
        default=None,
        description="Опционально: запланировать отправку на конкретное время"
    )


class SendEmailRequest(BaseModel):
    template_id: TemplateId = Field(
        description="Идентификатор шаблона письма"
    )
    recipient: Recipient = Field(
        description="Информация о получателе"
    )
    subject: str = Field(
        description="Тема письма"
    )
    variables: Dict[str, Any] = Field(
        description="Переменные для подстановки в шаблон",
        default_factory=dict
    )
    metadata: Optional[EmailMetadata] = Field(
        default=None,
        description="Дополнительные параметры отправки"
    )


class SendEmailResponse(BaseModel):
    success: bool = Field(
        description="Флаг успешной отправки"
    )
    message: str = Field(
        description="Сообщение о результате отправки"
    )
    email_id: str = Field(
        description="Уникальный идентификатор отправленного письма"
    )
    sent_at: datetime = Field(
        description="Время отправки письма"
    )

