import logging
import os
from typing import Dict, Any
from models import TemplateId

logger = logging.getLogger("email-service.template-render")

class TemplateRenderer:
    def __init__(self, templates_dir: str = "templates"):
        self.templates_dir = templates_dir
        self.templates: Dict[str, str] = self._load_templates()
        logger.info(f"Loaded {len(self.templates)} email templates")

    def _load_templates(self) -> Dict[str, str]:
        templates = {}
        try:
            for template_id in TemplateId:
                file_path = os.path.join(self.templates_dir, f"{template_id.value}.html")
                if os.path.exists(file_path):
                    with open(file_path, 'r', encoding='utf-8') as file:
                        templates[template_id.value] = file.read()
                else:
                    logger.warning(f"Template file not found: {file_path}")
        except Exception as e:
            logger.error(f"Error loading templates: {e}")

        return templates

    def render(self, template_id: str, variables: Dict[str, Any]) -> str:
        if template_id not in self.templates:
            raise ValueError(f"Template not found: {template_id}")

        template_content = self.templates[template_id]

        for key, value in variables.items():
            placeholder = f"{{{{{key}}}}}"
            template_content = template_content.replace(placeholder, str(value))

        return template_content
