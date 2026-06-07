import { ExcelExtractorPage } from "@/components/features/excel-extractor/ExcelExtractorPage"

interface Props {
  searchParams: Promise<{ fileId?: string; from?: string }>
}

export default async function Page({ searchParams }: Props) {
  const { fileId, from } = await searchParams

  if (from === "history") {
    return <ExcelExtractorPage key="history" openSavedOnly />
  }

  if (fileId) {
    const id = parseInt(fileId, 10)
    if (!Number.isNaN(id)) {
      return <ExcelExtractorPage key={`file-${id}`} initialAttachmentId={id} />
    }
  }

  return <ExcelExtractorPage key="extract" />
}
