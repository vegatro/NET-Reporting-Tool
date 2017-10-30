using CoreLibrary;
using CoreLibrary.IO;
using Newtonsoft.Json;
using ReportTool.Models;
using ReportTool.Models.Repositories;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.SessionState;

namespace ReportTool.Handlers
{
    public class ReportHandler : IHttpHandler, IReadOnlySessionState
    {
        public bool IsReusable { get; }

        public void ProcessRequest(HttpContext context)
        {
            string action = context.Request["action"];
            string reportID = context.Request.QueryString["reportID"];

            if (action == "preview")
            {
                try
                {
                    string connectionString = context.Request.QueryString["cStr"];
                    string dbType = context.Request.QueryString["dbType"];
                    string query = context.Request.QueryString["query"];
                    string id = context.Request.QueryString["id"];

                    context.Response.Write(ReportRepository.GetPreviewHtml(context, connectionString, dbType, query, id));
                }
                catch(Exception ex)
                {
                    Log.Error(ex);
                }
            }
            else if (action == "designer")
            {
                try
                {
                    string connectionString = context.Request.QueryString["cStr"];
                    string dbType = context.Request.QueryString["dbType"];
                    string query = context.Request.QueryString["query"];
                    string id = context.Request.QueryString["id"];

                    string designerHtml = ReportRepository.GetDesignerHtml(context, connectionString, dbType, query, id);

                    if (string.IsNullOrEmpty(designerHtml))
                        context.Response.StatusCode = 500;

                    context.Response.Write(designerHtml);
                }
                catch(Exception ex)
                {
                    Log.Error(ex);
                }
            }
            else if(action == "config")
            {
                try
                {
                    context.Response.Write(System.IO.File.ReadAllText(context.Server.MapPath("~/FReportTool/config.json")));
                }
                catch (Exception ex)
                {
                    Log.Error(ex);
                }
            }
            else if(action == "checkDesignerSaved")
            {
                try
                {
                    var config = Extend.GetConfig();

                    if (System.IO.File.Exists(config.ReportPath + "/temp.frx"))
                        context.Response.Write(JsonConvert.SerializeObject(new { ResultCode = 200 }));
                    else
                        context.Response.Write(JsonConvert.SerializeObject(new { ResultCode = -200 }));
                }
                catch(Exception ex)
                {
                    Log.Error(ex);
                }
            }
            else if(action == "reports")
            {
                try
                {
                    var config = Extend.GetConfig();
                    var reports = ReportRepository.List();
                    var userReports = new List<Report>();

                    if (context.Session == null || context.Session[config.SessionUserIdKey] == null)
                    {
                        userReports = reports.Where(x => x.IsPublic == true).ToList();
                    }
                    else
                    {
                        foreach (var report in reports)
                        {
                            if (report.IsPublic || string.IsNullOrEmpty(report.UsersJson))
                            {
                                userReports.Add(report);
                                continue;
                            }

                            List<int> userIds = JsonConvert.DeserializeObject<List<int>>(report.UsersJson);

                            if (userIds.Contains(Convert.ToInt32(context.Session[config.SessionUserIdKey])))
                                userReports.Add(report);
                        }
                    }

                    var reportsJson = JsonConvert.SerializeObject(new { ResultCode = 200, Reports = userReports });

                    if (context.Session != null && context.Session[config.SessionAdminKey] != null)
                        reportsJson = JsonConvert.SerializeObject(new { ResultCode = 200, Reports = reports });

                    context.Response.Write(reportsJson);
                }
                catch(Exception ex)
                {
                    Log.Error(ex);
                }
            }
            else if (action == "copy")
            {
                try
                {
                    var id = Convert.ToInt32(context.Request.Form["id"]);
                    bool copied = ReportRepository.Copy(id);

                    if (copied)
                        context.Response.Write(JsonConvert.SerializeObject(new { ResultCode = 200 }));
                    else
                        context.Response.Write(JsonConvert.SerializeObject(new { ResultCode = -200 }));
                }
                catch (Exception ex)
                {
                    Log.Error(ex);
                }
            }
            else if (action == "delete")
            {
                try
                {
                    var id = Convert.ToInt32(context.Request.Form["id"]);
                    bool deleted = ReportRepository.Delete(id);

                    if (deleted)
                        context.Response.Write(JsonConvert.SerializeObject(new { ResultCode = 200 }));
                    else
                        context.Response.Write(JsonConvert.SerializeObject(new { ResultCode = -200 }));
                }
                catch(Exception ex)
                {
                    Log.Error(ex);
                }
            }
            else if(action == "save")
            {
                bool isSaved = false;

                try
                {
                    var report = new Report()
                    {
                        Name = context.Request.Form["rName"],
                        ConnectionName = context.Request.Form["cName"],
                        ConnectionString = context.Request.Form["cStr"],
                        Query = context.Request.Form["query"],
                        DatabaseType = context.Request.Form["dbType"],
                        FiltersJson = context.Request.Form["filtersJson"],
                        SendEmail = Convert.ToBoolean(context.Request.Form["sendEmail"]),
                        EmailPeriod = context.Request.Form["emailPeriod"],
                        EmailTo = context.Request.Form["emailTo"],
                        EmailCC = context.Request.Form["emailCC"],
                        IsPublic = Convert.ToBoolean(context.Request.Form["isPublic"]),
                        UsersJson = context.Request.Form["users"]
                    };

                    if (!string.IsNullOrEmpty(context.Request.Form["emailStartDate"]))
                        report.EmailStartDate = DateTime.ParseExact(context.Request.Form["emailStartDate"], "dd.MM.yyyy HH:mm", CultureInfo.InvariantCulture);
                    else
                        report.EmailStartDate = DateTime.Now;

                    if (!string.IsNullOrEmpty(context.Request.Form["id"]))
                        report.Id = Convert.ToInt32(context.Request.Form["id"]);

                    isSaved = ReportRepository.Save(context, report);
                }
                catch(Exception ex)
                {
                    Log.Error(ex);
                }

                if(isSaved)
                    context.Response.Write(JsonConvert.SerializeObject(new { ResultCode = 200 }));
                else
                    context.Response.Write(JsonConvert.SerializeObject(new { ResultCode = -200 }));
            }
            else if (reportID == "DesignReport")
            {
                try
                {
                    Stream reportForSave = context.Request.InputStream;
                    var config = Extend.GetConfig();
                    string pathToSave = config.ReportPath + "/temp.frx";

                    if (!Directory.Exists(config.ReportPath))
                        Directory.CreateDirectory(config.ReportPath);

                    using (FileStream file = new FileStream(pathToSave, FileMode.Create))
                    {
                        reportForSave.CopyTo(file);
                    }
                }
                catch(Exception ex)
                {
                    Log.Error(ex);
                }
            }
            else if (action == "admin")
            {
                try
                {
                    var config = Extend.GetConfig();

                    if (context.Session != null && context.Session[config.SessionAdminKey] != null)
                        context.Response.WriteFile(context.Server.MapPath("~/FReportTool/Admin/index.html"));
                    else
                        context.Response.WriteFile(context.Server.MapPath("~/FReportTool/Admin/unauthorized.html"));
                }
                catch(Exception ex)
                {
                    Log.Error(ex);
                }
            }
            else if (action == "client")
            {
                try
                {
                    context.Response.WriteFile(context.Server.MapPath("~/FReportTool/Client/index.html"));
                }
                catch(Exception ex)
                {
                    Log.Error(ex);
                }
            }
        }
    }
}
