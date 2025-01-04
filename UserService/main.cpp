#include <iostream>
#include "../libraries/httplib.h"
#include "UserPersonal_Info/UserAccountCRUD/CreateData/UserPersonal_InfoCreate.h"
#include "UserPersonal_Info/UserAccountCRUD/UpdateData/UserPersonal_InfoUpdate.h"
#include "UserPersonal_Info/UserAccountCRUD/DeleteAccount/DeleteAccountImpl.h"
#include "UserPersonal_Info/MatchHistory/GetMatchHistory.h"

int main() {
    try {
        httplib::Server server;
        // инициализация хоста и порта для подключения
        std::string connect = "dbname=user_personal_account host=localhost port=5432";
        Database db(connect);
        db.initDbFromFile("/Users/nazarzakrevskij/TicketsPreOrderService/UserService/postgres/organizer_personal_account.sql");
        pqxx::connection C(connect);
        pqxx::work W(C);
        W.commit();

        server.Post("/create_personal_info", [&db](const httplib::Request& request, httplib::Response &res) {
            UserPersonal_InfoCreate userPersonalInfoCreate;
            userPersonalInfoCreate.UserPersonalInfoCreateRequest(request, res, db);
        });

        server.Post("/update_personal_info", [&db](const httplib::Request& request, httplib::Response &res) {
            UserPersonal_InfoUpdate userPersonalInfoUpdate;
            userPersonalInfoUpdate.UserPersonalInfoUpdateRequest(request, res, db);
        });

        server.Get("/get_match_history", [&db](const httplib::Request& request, httplib::Response &res) {
            GetMatchHistory getMatchHistory;
            getMatchHistory.GetMatchHistoryRequest(request, res, db);
        });

        server.Delete("/delete_account", [&db](const httplib::Request& request, httplib::Response &res) {
            AccountDeleter accountDeleter;
            accountDeleter.DeleteAccountRequest(request, res, db);
        });

        std::cout << "Server is listening http://localhost:8081" << '\n';
        server.listen("localhost", 8081);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << '\n';
    }
}