use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct OrgApproveBody {
    pub(crate) email: String,
    pub(crate) company: String,
    pub(crate) tin: String,
    pub(crate) status: String,
}