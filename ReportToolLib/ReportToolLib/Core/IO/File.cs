using System;
using System.IO;

namespace CoreLibrary.IO
{
    /// <summary>
    /// File operations
    /// </summary>
    internal class File
    {
        /// <summary>
        /// Writes given text to file with file mode
        /// </summary>
        /// <param name="path">File Path</param>
        /// <param name="mode">File Mode</param>
        /// <param name="create">If true creates file if not exists</param>
        /// <param name="action">Writer action</param>
        private static void Write(string path, FileMode mode, bool create, Action<StreamWriter> action)
        {
            try
            {
                // Create file if not exists
                if (create && !System.IO.File.Exists(path))
                    System.IO.File.Create(path).Dispose();

                // Write text to file
                FileStream fileStream = new FileStream(path, mode);
                using (StreamWriter writer = new StreamWriter(fileStream))
                    action(writer);
           
            } catch(Exception ex) {
                throw ex;
            } 
        }

        /// <summary>
        /// Writes given text to file with file mode
        /// </summary>
        /// <param name="path">File Path</param>
        /// <param name="text">Given text</param>
        /// <param name="mode">File Mode</param>
        /// <param name="create">If true creates file if not exists</param>
        public static void Write(string path, string text, FileMode mode = FileMode.Append, bool create = true)
        {
            Write(path, mode, create, writer => {
                writer.Write(text);
            });
        }

        /// <summary>
        /// Writes given text to file with new line
        /// </summary>
        /// <param name="path">File Path</param>
        /// <param name="text">Given text</param>
        /// <param name="mode">File Mode</param>
        /// <param name="create">If true creates file if not exists</param>
        public static void WriteLine(string path, string text, FileMode mode = FileMode.Append, bool create = true)
        {
            Write(path, mode, create, writer => {
                writer.WriteLine(text);
            });
        }

        ///// <summary>
        ///// Writes given text to file with file mode asyncroniously
        ///// </summary>
        ///// <param name="path">File Path</param>
        ///// <param name="text">Given text</param>
        ///// <param name="mode">File Mode</param>
        ///// <param name="create">If true creates file if not exists</param>
        //public static async void WriteAsync(string path, string text, FileMode mode = FileMode.Append, bool create = true)
        //{
        //    try
        //    {
        //        // Create file if not exists
        //        if (create && !System.IO.File.Exists(path))
        //            System.IO.File.Create(path).Dispose();

        //        // Write text to file
        //        FileStream fileStream = new FileStream(path, mode);
        //        using (StreamWriter writer = new StreamWriter(fileStream))
        //            await writer.WriteAsync(text);
        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }
        //}

        ///// <summary>
        ///// Writes given text to file with file mode asyncroniously with new line
        ///// </summary>
        ///// <param name="path">File Path</param>
        ///// <param name="text">Given text</param>
        ///// <param name="mode">File Mode</param>
        ///// <param name="create">If true creates file if not exists</param>
        //public static async void WriteLineAsync(string path, string text, FileMode mode = FileMode.Append, bool create = true)
        //{
        //    try
        //    {
        //        // Create file if not exists
        //        if (create && !System.IO.File.Exists(path))
        //            System.IO.File.Create(path).Dispose();

        //        // Write text to file
        //        FileStream fileStream = new FileStream(path, mode);
        //        using (StreamWriter writer = new StreamWriter(fileStream))
        //            await writer.WriteLineAsync(text);
        //    }
        //    catch (Exception ex)
        //    {
        //        throw ex;
        //    }
        //}
    }
}
