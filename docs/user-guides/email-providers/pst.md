# PST Import

OpenArchiver allows you to import PST files. This is useful for importing emails from a variety of sources, including Microsoft Outlook.

## Preparing the PST File

To ensure a successful import, you should prepare your PST file according to the following guidelines:

- **Structure:** The PST file can contain any number of emails, organized in any folder structure. The folder structure will be preserved in OpenArchiver, so you can use it to organize your emails.
- **Password Protection:** OpenArchiver does not support password-protected PST files. Please remove the password from your PST file before importing it.

## Creating a PST Ingestion Source

1.  Go to the **Ingestion Sources** page in the OpenArchiver dashboard.
2.  Click the **Create New** button.
3.  Select **PST Import** as the provider.
4.  Enter a name for the ingestion source.
5.  Click the **Choose File** button and select the PST file.
6.  Click the **Submit** button.

OpenArchiver will then start importing the emails from the PST file. The ingestion process may take some time, depending on the size of the file.
