"use client"

import { CollaborationIcon } from "@/components/CollaborationIcon"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { useModalsStore } from "@/store/modalsStore"

export default function ModalMoreInfo24() {
  const { isOpen, closeModal } = useModalsStore()
  return (
    <ModalMoreInfo
      isOpen={isOpen["24MoreInfo"]}
      onClose={() => closeModal("24MoreInfo")}
      label="24_dashboard-mui"
      siteUrl="https://24-dashboard-mui.vercel.app"
      taskLabel="Create dashboard using MUI"
      deadline="2 weeks"
      collaborationChildren={
        <>
          <CollaborationIcon
            tooltiptext={
              <div className="flex flex-col gap-y-md">
                <h1>Whole site</h1>
                <div>
                  <h1>Functionalify:</h1>
                  <h1>Advanced dark mode</h1>
                  <h1>Auth with Clerk</h1>
                </div>
              </div>
            }
          />
        </>
      }
    />
  )
}
