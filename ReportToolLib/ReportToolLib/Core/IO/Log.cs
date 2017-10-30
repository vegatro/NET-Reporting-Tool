using Newtonsoft.Json;
using ReportTool.Models;
using System;
using System.IO;

namespace CoreLibrary.IO
{
    /// <summary>
    /// Logging, Tracing Operations
    /// </summary>
    internal class Log
    {
        /// <summary>
        /// Traces given message
        /// </summary>
        /// <param name="message">string message</param>
        /// <param name="pathKeyPrefix">configuration prefix</param>
        public static void Trace(string message, string pathKeyPrefix = "Trace")
        {
            var config = Extend.GetConfig();

            if (!Directory.Exists(config.TracePath))
                Directory.CreateDirectory(config.TracePath);

            string path = config.TracePath + "/{yyyy}{MM}{dd}.txt";

            if (!config.TraceEnabled)
                return;

            if (string.IsNullOrEmpty(path))
                return;

            // If path includes date hirerarchy or dependency replace with datetime info
            path = path
                .Replace("{yyyy}", DateTime.Now.ToString("yyyy"))
                .Replace("{MM}",   DateTime.Now.ToString("MM"))
                .Replace("{dd}",   DateTime.Now.ToString("dd"));

            File.WriteLine(path, "[T][" + DateTime.Now.ToString("yyyy-MM-dd hh:mm:ss.fff") + "] [M][" + message + "]");
        }

        /// <summary>
        /// Logs given error string and stack trace
        /// </summary>
        /// <param name="error">error message</param>
        /// <param name="stackTrace">stack trace</param>
        /// <param name="pathKeyPrefix">configuration prefix</param>
        public static void Error(string error, string stackTrace = "", string pathKeyPrefix = "Error")
        {
            var config = Extend.GetConfig();

            if (!Directory.Exists(config.ErrorPath))
                Directory.CreateDirectory(config.ErrorPath);

            string path = config.ErrorPath + "/{yyyy}{MM}{dd}.txt";

            // Check error enabled
            if (!config.ErrorEnabled)
                return;

            if (string.IsNullOrEmpty(path))
                return;

            string now     = DateTime.Now.ToString("yyyy-MM-dd hh:mm:ss.fff");
            string errorId = Guid.NewGuid().ToString();

            // If path includes date hirerarchy or dependency replace with datetime info
            path = path
                .Replace("{yyyy}", DateTime.Now.ToString("yyyy"))
                .Replace("{MM}",   DateTime.Now.ToString("MM"))
                .Replace("{dd}",   DateTime.Now.ToString("dd"));

            File.WriteLine(path, "[T][" + now + "][M] [" + errorId + "][" + error + "]");
            File.WriteLine(path, "[T][" + now + "][E] [" + errorId + "][" + error + (!string.IsNullOrEmpty(stackTrace) ? " [ST]-" + stackTrace : "") + "]");
        }

        /// <summary>
        /// Logs exception
        /// </summary>
        /// <param name="exception">Exception</param>
        public static void Error(Exception exception)
        {
            Error(exception.Message, exception.StackTrace);
        }
    }
}
