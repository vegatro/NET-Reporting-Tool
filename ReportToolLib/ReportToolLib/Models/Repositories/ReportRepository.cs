using CoreLibrary;
using CoreLibrary.Database;
using FastReport.Data;
using FastReport.Web;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Web.UI.WebControls;
using MySql.Data;
using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using FastReport;
using System.Web;
using Oracle.ManagedDataAccess.Client;
using CoreLibrary.IO;
using FastReport.Export.Pdf;
using FastReport.Export.Html;
using FastReport.Export.Image;

namespace ReportTool.Models.Repositories
{
    public class ReportRepository
    {
        public static bool Delete(int id) => MsSQL.Run("report_delete", new List<object> { id });

        public static bool Copy(int id) {
            bool copied = false;

            MsSQL.Prepare(conn =>
            {
                DataSet ds = MsSQL.RunDataSetQuery(ref conn, "report_copy",
                    new List<object> {
                        id
                    });

                if (!Utils.IsDataSetValid(ds))
                    return;

                int resultCode = Convert.ToInt32(ds.Tables[0].Rows[0]["ResultCode"]);

                if (resultCode == 200)
                {
                    var config = Extend.GetConfig();
                    int newReportId = Convert.ToInt32(ds.Tables[0].Rows[0]["Id"]);

                    if (System.IO.File.Exists(config.ReportPath + "/" + id + ".frx"))
                        System.IO.File.Copy(config.ReportPath + "/" + id + ".frx", config.ReportPath + "/" + newReportId + ".frx");

                    copied = true;
                }
            });

            return copied;
        }

        public static List<Report> List() => MsSQL.List<Report>("report_getAll", null, (result, row) => { result.Add(Report.Parse(row)); });

        public static bool Save(HttpContext context, Report report)
        {
            bool isSaved = false;

            MsSQL.Prepare(conn =>
            {
                DataSet ds = MsSQL.RunDataSetQuery(ref conn, "report_save",
                    new List<object> {
                        report.Name,
                        report.ConnectionName,
                        report.ConnectionString,
                        report.Query,
                        report.DatabaseType,
                        report.FiltersJson,
                        report.SendEmail,
                        report.EmailPeriod,
                        report.EmailStartDate,
                        report.EmailTo,
                        report.EmailCC,
                        report.IsPublic,
                        report.UsersJson,
                        report.Id
                    });

                if (!Utils.IsDataSetValid(ds))
                    return;

                int resultCode = Convert.ToInt32(ds.Tables[0].Rows[0]["ResultCode"]);

                if (resultCode == 200)
                {
                    var config = Extend.GetConfig();
                    report.Id = Convert.ToInt32(ds.Tables[0].Rows[0]["Id"]);

                    if (System.IO.File.Exists(config.ReportPath + "/temp.frx"))
                    {
                        System.IO.File.Delete(config.ReportPath + "/" + report.Id + ".frx");
                        System.IO.File.Move(config.ReportPath + "/temp.frx", config.ReportPath + "/" + report.Id + ".frx");
                    }

                    isSaved = ExportToPdf(report);
                }
            });

            return isSaved;
        }

        public static bool ExportToPdf(Report report)
        {
            bool exported = false;

            try
            {
                var webReport = GetPreview(HttpContext.Current, report.ConnectionString, report.DatabaseType, report.Query, report.Id.ToString());

                webReport.Report.Prepare();
                PDFExport pdfExport = new PDFExport();
                pdfExport.ShowProgress = false;
                pdfExport.Compressed = true;
                pdfExport.AllowPrint = true;
                pdfExport.EmbeddingFonts = true;

                Extend.OpenNetworkConnection(networkFilePath =>
                {
                    webReport.Report.Export(pdfExport, @networkFilePath + "/" + report.Id + ".pdf");
                    exported = true;
                });
            }
            catch(Exception ex)
            {
                Log.Error(ex);
            }

            return exported;
        }

        public static WebReport GetDesigner(HttpContext context, string connectionString, string dbType, string query, string id = "")
        {
            WebReport webReport = new WebReport();

            webReport.Width = Unit.Percentage(100);
            webReport.Height = Unit.Percentage(100); ;

            var config = Extend.GetConfig();
            DataSet data = new DataSet();

            if (dbType == "MsSQL")
            {
                using (SqlConnection conn = new SqlConnection())
                {
                    //conn.ConnectionString = "Data Source=.;Initial Catalog=REPORT;Integrated Security=True;";
                    conn.ConnectionString = connectionString;
                    SqlCommand cmd = conn.CreateCommand();
                    SqlDataAdapter da = new SqlDataAdapter();
                    cmd.CommandText = query;
                    da.SelectCommand = cmd;
                    conn.Open();
                    da.Fill(data);
                    conn.Close();
                }
            }
            else if(dbType == "MySQL" || dbType == "MariaDB")
            {
                using (MySqlConnection conn = new MySqlConnection())
                {
                    conn.ConnectionString = connectionString;
                    MySqlCommand cmd = conn.CreateCommand();
                    MySqlDataAdapter da = new MySqlDataAdapter();
                    cmd.CommandText = query;
                    da.SelectCommand = cmd;
                    conn.Open();
                    da.Fill(data);
                    conn.Close();
                }
            }
            else if (dbType == "Oracle")
            {
                using (OracleConnection conn = new OracleConnection())
                {
                    conn.ConnectionString = connectionString;
                    OracleCommand cmd = conn.CreateCommand();
                    OracleDataAdapter da = new OracleDataAdapter();
                    cmd.CommandText = query;
                    da.SelectCommand = cmd;
                    conn.Open();
                    da.Fill(data);
                    conn.Close();
                }
            }

            webReport.Report.Dictionary.Report.RegisterData(data, "reportData");

            if (!string.IsNullOrEmpty(config.ReportPath))
            {
                if (!Directory.Exists(config.ReportPath))
                    Directory.CreateDirectory(config.ReportPath);

                if (System.IO.File.Exists(config.ReportPath + "/temp.frx"))
                    System.IO.File.Delete(config.ReportPath + "/temp.frx");

                if (System.IO.File.Exists(config.ReportPath + "/" + id + ".frx"))
                    webReport.Report.Load(config.ReportPath + "/" + id + ".frx");
            }

            foreach (DataSourceBase dsItem in webReport.Report.Dictionary.DataSources)
            {
                dsItem.Enabled = true;
            }

            //(webReport.Report.FindObject("Table") as DataBand).DataSource = webReport.Report.GetDataSource("reportData");

            webReport.DesignReport = true;
            webReport.DesignScriptCode = false;
            //webReport.Debug = true;
            webReport.DesignerPath = "~/FReportTool/WebReportDesigner/index.html";
            webReport.DesignerLocale = "tr";
            webReport.InlineRegistration = true;
            webReport.ExternalJquery = true;
            //webReport.LocalizationFile = "~/Localization/German.frl";
            webReport.DesignerSaveCallBack = "~/ReportTool.axd";
            webReport.ID = "DesignReport";

            return webReport;
        }

        public static string GetDesignerHtml(HttpContext context, string connectionString, string dbType, string query, string id = "")
        {
            string html = "";

            try
            {
                WebReport webReport = GetDesigner(context, connectionString, dbType, query, id);
                html = webReport.GetHtml().ToHtmlString();
            }
            catch(Exception ex)
            {
                Log.Error(ex);
            }

            return html;
        }

        public static WebReport GetPreview(HttpContext context, string connectionString, string dbType, string query, string id)
        {
            WebReport webReport = new WebReport();
            DataSet reportDataSet = new DataSet();
            var config = Extend.GetConfig();

            if (dbType == "MsSQL")
            {
                using (SqlConnection conn = new SqlConnection())
                {
                    //conn.ConnectionString = "Data Source=.;Initial Catalog=REPORT;Integrated Security=True;";
                    conn.ConnectionString = connectionString;
                    SqlCommand cmd = conn.CreateCommand();
                    SqlDataAdapter da = new SqlDataAdapter();
                    cmd.CommandText = query;
                    da.SelectCommand = cmd;
                    conn.Open();
                    da.Fill(reportDataSet);
                    conn.Close();
                }
            }
            else if (dbType == "MySQL" || dbType == "MariaDB")
            {
                using (MySqlConnection conn = new MySqlConnection())
                {
                    conn.ConnectionString = connectionString;
                    MySqlCommand cmd = conn.CreateCommand();
                    MySqlDataAdapter da = new MySqlDataAdapter();
                    cmd.CommandText = query;
                    da.SelectCommand = cmd;
                    conn.Open();
                    da.Fill(reportDataSet);
                    conn.Close();
                }
            }
            else if (dbType == "Oracle")
            {
                using (OracleConnection conn = new OracleConnection())
                {
                    conn.ConnectionString = connectionString;
                    OracleCommand cmd = conn.CreateCommand();
                    OracleDataAdapter da = new OracleDataAdapter();
                    cmd.CommandText = query;
                    da.SelectCommand = cmd;
                    conn.Open();
                    da.Fill(reportDataSet);
                    conn.Close();
                }
            }

            webReport.Report.Dictionary.Report.RegisterData(reportDataSet, "reportData");

            webReport.Width = Unit.Percentage(100);
            webReport.Height = Unit.Percentage(100);
            webReport.ShowToolbar = false;
            webReport.ToolbarIconsStyle = ToolbarIconsStyle.Black;
            // webReport.LocalizationFile = "~/Localization/German.frl";            
            webReport.EmbedPictures = true;
            webReport.XlsxPageBreaks = false;
            webReport.XlsxSeamless = true;
            webReport.InlineRegistration = true;
            webReport.ExternalJquery = true;
            

            if (!string.IsNullOrEmpty(config.ReportPath))
            {
                if (!Directory.Exists(config.ReportPath))
                    Directory.CreateDirectory(config.ReportPath);

                if (System.IO.File.Exists(config.ReportPath + "/" + id + ".frx"))
                    webReport.Report.Load(config.ReportPath + "/" + id + ".frx");
            }

            return webReport;
        }

        public static string GetPreviewHtml(HttpContext context, string connectionString, string dbType, string query, string id)
        {
            string html = "";

            try
            {
                WebReport webReport = GetPreview(context, connectionString, dbType, query, id);
                html = webReport.GetHtml().ToHtmlString();
            }
            catch (Exception ex)
            {
                Log.Error(ex);
            }

            return html;
        }
    }
}
