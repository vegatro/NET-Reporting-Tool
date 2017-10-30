using CoreLibrary.IO;
using Newtonsoft.Json;
using ReportTool.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;

namespace CoreLibrary
{
    internal class Extend
    {
        public static Config GetConfig()
        {
            Config config = JsonConvert.DeserializeObject<Config>(
                System.IO.File.ReadAllText(System.Web.HttpContext.Current.Server.MapPath("~/FReportTool/config.json")));

            return config;
        }

        public static void OpenNetworkConnection(Action<String> callback)
        {
            try
            {
                bool networkPathEnabled = Extend.GetConfig().PdfNetworkPathEnabled;
                string physicalFilePath = Extend.GetConfig().PdfPhysicalPath;
                string networkFilePath = Extend.GetConfig().PdfNetworkPath;
                string networkUsername = Extend.GetConfig().PdfNetworkUsername;
                string networkPassword = Extend.GetConfig().PdfNetworkPassword;

                //networkFilePath = @"\\DESKTOP-6GRVG5N\pdf2\";

                if (networkPathEnabled)
                {
                    using (new NetworkConnection(@networkFilePath, new NetworkCredential(@networkUsername, @networkPassword)))
                    {
                        if (!Directory.Exists(@networkFilePath))
                            Directory.CreateDirectory(@networkFilePath);

                        callback(@networkFilePath);
                    }
                }
                else
                {
                    if (!Directory.Exists(@physicalFilePath))
                        Directory.CreateDirectory(@physicalFilePath);

                    callback(@physicalFilePath);
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex);
                throw (ex);
            }
        }
    }
}
