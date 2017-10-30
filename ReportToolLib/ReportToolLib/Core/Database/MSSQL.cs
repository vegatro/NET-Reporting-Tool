using CoreLibrary.IO;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Text;

namespace CoreLibrary.Database
{
    /// <summary>
    /// Microsoft SQL Adapter 
    /// </summary>
    internal class MsSQL
    {
        /// <summary>
        /// SQL query command timeout in seconds
        /// </summary>
        public static int TimeoutCommand = 600;

        /// <summary>
        /// Opens database connection
        /// </summary>
        /// <param name="connection">SqlConnection</param>
        /// <returns>Returns true if succeed</returns>
        public static bool Connect(ref SqlConnection connection)
        {
            try
            {
                if (connection != null)
                {
                    if (connection.State != ConnectionState.Open)
                        connection.Open();

                    return true;
                }

                connection = new SqlConnection
                {
                    ConnectionString = Extend.GetConfig().DBConnectionString
                };

                connection.Open();

                return true;
            }
            catch (Exception ex)
            {
                Log.Error(ex);
            }

            return false;
        }

        /// <summary>
        /// Disconnects database connection
        /// </summary>
        /// <param name="connection">MySqlConnection</param>
        /// <returns>Returns true if succeed or connection is null</returns>
        public static bool Disconnect(ref SqlConnection connection)
        {
            if (connection == null)
                return true;

            try
            {
                if (connection.State != ConnectionState.Closed)
                    connection.Close();

                connection = null;

                return true;
            }
            catch (Exception ex)
            {
                Log.Error(ex);
                return false;
            }
        }

        /// <summary>
        /// Opens connection and gives caller an instance of connection to run MySQL queries 
        /// and closes connection 
        /// </summary>
        /// <param name="dbAction">Desired specific database action</param>
        /// <returns>True if connection opens successfully</returns>
        public static bool Prepare(Action<SqlConnection> dbAction)
        {
            SqlConnection connection = null;

            try
            {
                if (!Connect(ref connection))
                    return false;

                dbAction(connection);

                return true;
            }
            catch (Exception ex)
            {
                Log.Error(ex);
                return false;
            }
            finally
            {
                Disconnect(ref connection);
            }
        }

        /// <summary>
        /// Runs query
        /// </summary>
        /// <param name="connection">ref sql connection</param>
        /// <param name="query">query string</param>
        /// <returns>Affected row count, if fails return -1</returns>
        public static int RunQuery(ref SqlConnection connection, string query)
        {
            SqlCommand objCommand = new SqlCommand
            {
                CommandText = query,
                Connection  = connection
            };

            try
            {
                string commandTimeout = Extend.GetConfig().DBCommandTimeout;

                if (!string.IsNullOrEmpty(commandTimeout))
                    TimeoutCommand = Convert.ToInt32(commandTimeout);
            } catch (Exception ex) {
                Log.Error(ex);
            }

            objCommand.CommandTimeout = TimeoutCommand;

            int affectedRows = -1;

            Log.Trace("[QE] " + query);
            try
            {
                objCommand.CommandTimeout = TimeoutCommand;

                affectedRows = objCommand.ExecuteNonQuery();
                Log.Trace("[QR] " + query);
            }
            catch (Exception ex)
            {
                Log.Error(ex);
            }

            return affectedRows;
        }

        /// <summary>
        /// Runs query
        /// </summary>
        /// <param name="connection">ref sql connection</param>
        /// <param name="procedure">store procedure name without CALL</param>
        /// <param name="parameters">List of parameters</param>
        /// <returns>Affected row count, if fails return -1</returns>
        public static int RunQuery(ref SqlConnection connection, string procedure, List<object> parameters)
        {
            return RunQuery(ref connection, PrepareQuery(procedure, parameters));
        }

        /// <summary>
        /// Runs query and returns dataset
        /// </summary>
        /// <param name="connection">ref sql connection</param>
        /// <param name="query">query string</param>
        /// <returns>Returns dataset from database</returns>
        public static DataSet RunDataSetQuery(ref SqlConnection connection, string query)
        {
            SqlCommand objCommand = new SqlCommand
            {
                CommandText = query,
                Connection  = connection
            };

            try
            {
                string commandTimeout = Extend.GetConfig().DBCommandTimeout;

                if (!string.IsNullOrEmpty(commandTimeout))
                    TimeoutCommand = Convert.ToInt32(commandTimeout);
            }
            catch (Exception ex)
            {
                Log.Error(ex);
            }

            objCommand.CommandTimeout = TimeoutCommand;

            DataSet result = new DataSet();

            Log.Trace("[QE] " + query);
            try
            {
                SqlDataAdapter adapter = new SqlDataAdapter(objCommand);
                adapter.Fill(result);

                Log.Trace("[QR] " + query);
            }
            catch (Exception ex)
            {
                Log.Error(ex);
            }

            return result;
        }

        /// <summary>
        /// Runs query and returns dataset
        /// </summary>
        /// <param name="connection">ref sql connection</param>
        /// <param name="procedure">query string</param>
        /// <param name="parameters">list of parameters</param>
        /// <returns>Returns dataset from database</returns>
        public static DataSet RunDataSetQuery(ref SqlConnection connection, string procedure, List<object> parameters)
        {
            return RunDataSetQuery(ref connection, PrepareQuery(procedure, parameters));
        }

        /// <summary>
        /// Creates store procedure query string
        /// </summary>
        /// <param name="procedure">Procedure name with or without EXEC</param>
        /// <param name="parameters">List of parameters</param>
        /// <returns>Query string</returns>
        public static string PrepareQuery(string procedure, List<object> parameters = null)
        {
            StringBuilder query = new StringBuilder(procedure.Contains("EXEC ") ? "" : "EXEC ");
            query.Append(procedure);

            if (parameters == null)
                return query.ToString();

            for (int i = 0; i < parameters.Count; i++)
            {
                object param = parameters[i];

                query.Append(" ");

                if (param == null)
                    query.Append("NULL");
                else if (param is long)
                    query.Append(Utils.SqlLong((long)param));
                else if (param is int)
                    query.Append(Utils.SqlInt((int)param));
                else if (param is string)
                    query.Append(Utils.SqlNVarchar((string)param));
                else if (param is double || param is float)
                    query.Append(Utils.SqlDouble((double)param));
                else if (param is bool)
                    query.Append(Utils.SqlBoolean((bool)param));
                else if (param is DateTime)
                    query.Append(Utils.SqlDatetime((DateTime)param, true));

                if (i != parameters.Count - 1)
                    query.Append(",");
            }

            return query.ToString();
        }

        /// <summary>
        /// Gets objects from database by given query
        /// </summary>
        /// <typeparam name="T">Object Type</typeparam>
        /// <param name="query">Query</param>
        /// <param name="parameters">List of parameters</param>
        /// <param name="callback">Callback method</param>
        /// <returns>Given generic object</returns>
        public static T Get<T>(string query, List<object> parameters, Action<T, DataRow> callback)
        {
            T result = default(T);

            Prepare(conn =>
            {
                DataSet ds = RunDataSetQuery(ref conn, query, parameters);
                if (!Utils.IsDataSetValid(ds))
                    return;

                foreach (DataRow row in ds.Tables[0].Rows)
                    callback(result, row);
            });

            return result;
        }

        /// <summary>
        /// Gets objects from database by given query
        /// </summary>
        /// <typeparam name="T">Object Type</typeparam>
        /// <param name="query">Query</param>
        /// <param name="parameters">List of parameters</param>
        /// <param name="callback">Callback method</param>
        /// <returns>Given generic object</returns>
        public static List<T> List<T>(string query, List<object> parameters, Action<List<T>, DataRow> callback)
        {
            List<T> result = new List<T>();

            Prepare(conn =>
            {
                DataSet ds = RunDataSetQuery(ref conn, query, parameters);
                if (!Utils.IsDataSetValid(ds))
                    return;

                foreach (DataRow row in ds.Tables[0].Rows)
                    callback(result, row);
            });

            return result;
        }

        /// <summary>
        /// Runs query
        /// </summary>
        /// <param name="query">Query</param>
        /// <param name="parameters">List of Parameters</param>
        /// <returns>boolean</returns>
        public static bool Run(string query, List<object> parameters)
        {
            bool result = false;

            Prepare(conn =>
            {
                RunQuery(ref conn, query, parameters);
                result = true;
            });

            return result;
        }
    }
}
