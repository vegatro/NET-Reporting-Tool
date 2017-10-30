using CoreLibrary.Database;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;

namespace ReportTool.Models
{
    public class Report
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string ConnectionName { get; set; }
        public string ConnectionString { get; set; }
        public string Query { get; set; }
        public string DatabaseType { get; set; }
        public string FiltersJson { get; set; }
        public bool SendEmail { get; set; }
        public string EmailPeriod { get; set; }
        public DateTime EmailStartDate { get; set; }
        public string EmailStartDateStr { get; set; }
        public string EmailTo { get; set; }
        public string EmailCC { get; set; }
        public bool IsPublic { get; set; }
        public string UsersJson { get; set; }

        public static Report Parse(DataRow row)
        {
            return new Report
            {
                Id = Utils.GetInteger(row["Id"]),
                Name = Utils.GetString(row["Name"]),
                ConnectionName = Utils.GetString(row["ConnectionName"]),
                ConnectionString = Utils.GetString(row["ConnectionString"]),
                Query = Utils.GetString(row["Query"]),
                DatabaseType = Utils.GetString(row["DatabaseType"]),
                FiltersJson = Utils.GetString(row["FiltersJson"]),
                SendEmail = Utils.GetBool(row["SendEmail"]),
                EmailPeriod = Utils.GetString(row["EmailPeriod"]),
                EmailStartDate = Utils.GetDatetime(row["EmailStartDate"]),
                EmailStartDateStr = Utils.GetDatetime(row["EmailStartDate"]).ToString("dd/MM/yyyy HH:mm"),
                EmailTo = Utils.GetString(row["EmailTo"]),
                EmailCC = Utils.GetString(row["EmailCC"]),
                IsPublic = Utils.GetBool(row["IsPublic"]),
                UsersJson = Utils.GetString(row["UsersJson"])
            };
        }
    }
}
