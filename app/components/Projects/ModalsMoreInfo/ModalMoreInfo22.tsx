"use client"

import { CollaborationIcon } from "@/components/CollaborationIcon"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { useModalsStore } from "@/store/modalsStore"

export default function ModalMoreInfo22() {
  const { isOpen, closeModal } = useModalsStore()
  return (
    <ModalMoreInfo
      isOpen={isOpen["22MoreInfo"]}
      onClose={() => closeModal("22MoreInfo")}
      label="22_aer"
      siteUrl="https://22-aer-nicitaa.vercel.app/"
      taskLabel="Create web site which will sell begs"
      deadline="1 month"
      collaborationChildren={
        <>
          <CollaborationIcon
            tooltiptext={
              <div className="flex flex-col gap-y-md">
                <h1>Rest of figma design</h1>
                <div>
                  <h1>Team leader:</h1>
                  <h1>Notion organization</h1>
                  <h1>Pull requests reviewing</h1>
                  <h1> Tasks assigning</h1>
                </div>
                <div>
                  <h1>Pages:</h1>
                  <h1>root - navbar + animations</h1>
                  <h1>/ - whole page</h1>
                  <h1>/products - dropdown</h1>
                  <h1>/about - whole page</h1>
                </div>
              </div>
            }
          />
          <CollaborationIcon
            imgSrc="/collaborations/22_aer/ottakist.png"
            profileUrl="https://github.com/ottakist"
            tooltiptext={
              <div className="flex flex-col gap-y-md">
                <h1>Initial figma design</h1>
                <div>
                  <h1>Pull requests reviewing</h1>
                  <h1>Tasks completing</h1>
                </div>
                <div>
                  <h1>Pages:</h1>
                  <h1>root - tailwind setup</h1>
                  <h1>/products - whole page</h1>
                  <h1>/product - whole page</h1>
                </div>
              </div>
            }
          />
          <CollaborationIcon
            imgSrc="/collaborations/22_aer/arifm6.png"
            profileUrl="https://github.com/arifm6"
            tooltiptext={
              <div className="flex flex-col gap-y-md">
                <div>
                  <h1>Pull requests reviewing</h1>
                  <h1>Tasks completing</h1>
                </div>
                <div>
                  <h1>Pages:</h1>
                  <h1>/auth/signin - frontend + backend</h1>
                  <h1>/auth/signup - frontend + backend</h1>
                  <h1>/auth/recover - frontend + backend</h1>
                </div>
              </div>
            }
          />
        </>
      }
    />
  )
}
