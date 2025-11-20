import { listAssetsForTableAction } from "@/actions/assets"
import { AssetsTable } from "./AssetsTable"

export const Assets = async () => {
  const assets = await listAssetsForTableAction({
    limit: 100,
    offset: 0,
  })

  return (
    <AssetsTable assets={assets} />
  )
}
