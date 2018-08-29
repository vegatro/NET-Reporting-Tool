using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ReportTool.Models
{
    public class Config
    {
        public string AppPrefix { get; set; }
        public string ReportPath { get; set; }
        public string TracePath { get; set; }
        public string ErrorPath { get; set; }
        public bool TraceEnabled { get; set; }
        public bool ErrorEnabled { get; set; }
        public string UserApiUrl { get; set; }
        public bool WriteSession { get; set; }
        public string SessionAdminKey { get; set; }
        public string SessionUserIdKey { get; set; }
        public string DBConnectionString { get; set; }
        public string DBCommandTimeout { get; set; }
        public bool PdfNetworkPathEnabled { get; set; }
        public string PdfPhysicalPath { get; set; }
        public string PdfNetworkPath { get; set; }
        public string PdfNetworkUsername { get; set; }
        public string PdfNetworkPassword { get; set; }
    }
}
