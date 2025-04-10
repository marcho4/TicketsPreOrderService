#include "AddPaymentProvider.h"

bool AddPaymentProvider::CheckProviderExistence(Database& db, const std::string& name) {
    std::string query = "SELECT * FROM PaymentsSchema.Providers WHERE provider_name = $1";
    std::vector<std::string> params = {name};

    pqxx::result result = db.executeQueryWithParams(query, params);

    return !result.empty();
}

std::string AddPaymentProvider::AddProvider(Database& db, const Provider& provider) {
    std::string query = "INSERT INTO PaymentsSchema.Providers (provider_name, provider_description) "
                        "VALUES ($1, $2) RETURNING provider_id";
    std::vector<std::string> params = {provider.provider_name, provider.provider_description};

    pqxx::result res = db.executeQueryWithParams(query, params);

    return res[0][0].as<std::string>();
}

void AddPaymentProvider::AddProviderRequest(const httplib::Request& req, httplib::Response& res, Database& db) {
    json response;
    try {
        Provider provider = Provider::GetFromJson(json::parse(req.body));
        if (CheckProviderExistence(db, provider.provider_name)) {
            ErrorHandler::sendError(res, 400, "Provider with this name already exists");
            return;
        }
        std::string provider_id = AddProvider(db, provider);
        response = {
                {"message", "Provider added successfully"},
                {"provider_id", provider_id}
        };
        res.status = 201;
    } catch (const std::exception& e) {
        ErrorHandler::sendError(res, 500, "some shit happens");
        return;
    }
    res.set_content(response.dump(), "application/json");
}
