use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, PartialEq, Serialize, Deserialize, ToSchema)]
pub struct OrgApproveBody {
    pub(crate) email: String,
    pub(crate) company: String,
    pub(crate) tin: String,
    pub(crate) status: String,
    pub(crate) user_id: String,
}