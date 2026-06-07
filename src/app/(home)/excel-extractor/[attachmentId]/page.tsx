import { redirect } from "next/navigation"

interface Props {
  params: Promise<{ attachmentId: string }>
}

export default async function Page({ params }: Props) {
  const { attachmentId } = await params
  redirect(`/excel-extractor?fileId=${attachmentId}`)
}
