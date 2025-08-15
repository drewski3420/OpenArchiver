import PDFParser from 'pdf2json';
import mammoth from 'mammoth';
import xlsx from 'xlsx';

function extractTextFromPdf(buffer: Buffer): Promise<string> {
	return new Promise((resolve) => {
		const pdfParser = new PDFParser(null, true);
		let completed = false;

		const finish = (text: string) => {
			if (completed) return;
			completed = true;
			pdfParser.removeAllListeners();
			resolve(text);
		};

		pdfParser.on('pdfParser_dataError', () => finish(''));
		pdfParser.on('pdfParser_dataReady', () => finish(pdfParser.getRawTextContent()));

		try {
			pdfParser.parseBuffer(buffer);
		} catch (err) {
			console.error('Error parsing PDF buffer', err);
			finish('');
		}

		// Prevent hanging if the parser never emits events
		setTimeout(() => finish(''), 10000);
	});
}

export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
	try {
		if (mimeType === 'application/pdf') {
			return await extractTextFromPdf(buffer);
		}

		if (
			mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
		) {
			const { value } = await mammoth.extractRawText({ buffer });
			return value;
		}

		if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
			const workbook = xlsx.read(buffer, { type: 'buffer' });
			let fullText = '';
			for (const sheetName of workbook.SheetNames) {
				const sheet = workbook.Sheets[sheetName];
				const sheetText = xlsx.utils.sheet_to_txt(sheet);
				fullText += sheetText + '\n';
			}
			return fullText;
		}

		if (
			mimeType.startsWith('text/') ||
			mimeType === 'application/json' ||
			mimeType === 'application/xml'
		) {
			return buffer.toString('utf-8');
		}
	} catch (error) {
		console.error(`Error extracting text from attachment with MIME type ${mimeType}:`, error);
		return ''; // Return empty string on failure
	}

	console.warn(`Unsupported MIME type for text extraction: ${mimeType}`);
	return ''; // Return empty string for unsupported types
}
