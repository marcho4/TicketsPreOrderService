#include "UpdateAccount.h"

void AccountUpdator::UpdateUserAccountRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    std::string user_id;

    if (!req.path_params.at("id").empty()) {
        user_id = req.path_params.at("id");
    } else {
        ErrorHandler::sendError(res, 400, "Missing id parameter");
        return;
    }

    auto parsed = json::parse(req.body);

    UserData user_data = UserData::GetUserDataFromJSON(parsed);

    if (!Validator::Validate(user_id, parsed, res, db)) {
        return;
    }

    pqxx::result response = UpdateUserAccountDB(user_data, user_id, db);

    if (response.affected_rows() == 0) {
        ErrorHandler::sendError(res, 404, "User not found or no changes made.");
    } else {
        res.status = 201;
        res.set_content(R"({"message": "User info updated successfully."})", "application/json");
    }
}
