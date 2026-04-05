"use client"

import { useModalsStore } from "@/store/modalsStore"
import { CollaborationIcon } from "@/components/CollaborationIcon"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"

export default function ModalMoreInfo23() {
  const { isOpen, closeModal } = useModalsStore()
  return (
    <ModalMoreInfo
      isOpen={isOpen["23MoreInfo"]}
      onClose={() => closeModal("23MoreInfo")}
      label="23_store"
      siteUrl="https://github.com/nicitaacom/23_store"
      taskLabel="Create site to buy and sell something"
      deadline="1 month"
      collaborationChildren={
        <CollaborationIcon
          tooltiptext={
            <div className="flex flex-col gap-y-sm">
              <h2>- fully functional auth (better than other sites have)</h2>
              <h2>
                - dark/light mode
                <br />
                (advanced - with icon color changing)
                <br />
              </h2>
              <h2>
                - created custom support chat
                <br />
                (with roles USER SUPPORT ADMIN)
              </h2>
              <h2>- users may add / edit / delete product</h2>
              <h2>- logic to search products by title and description</h2>
              <h2>
                - setup for payment with
                <br /> metamask & paypal & stripe
              </h2>
              <h2>
                - setup for supabase
                <br />
                (emails / SMTP / SQL tables / RLS
                <br /> / auth redirect URL)
              </h2>
              <h2>- organized tasks in github projects</h2>
              <h2>- fully documented the project</h2>
              <h2>- created scalability for the project</h2>
              <h2>- moved project from Vite to Next</h2>
              <h2 className="font-bold">More info see in my summary</h2>
            </div>
          }
        />
      }
    />
  )
}
