"use client"

import { useModalsStore } from "@/store/modalsStore"
import { CollaborationIcon } from "@/components/CollaborationIcon"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"

export default function ModalMoreInfo26() {
  const { isOpen, closeModal } = useModalsStore()
  return (
    <ModalMoreInfo
      isOpen={isOpen["26MoreInfo"]}
      onClose={() => closeModal("26MoreInfo")}
      label="Hot delivery"
      siteUrl="https://hot-delivery.vercel.app/"
      taskLabel="Created FullStack website for restaurant"
      deadline="2 weeks"
      collaborationChildren={
        <CollaborationIcon
          tooltiptext={
            <div className="flex flex-col gap-y-sm">
              <h2>
                - login/register functionality
                <br />
              </h2>
              <h2>
                - created custom support chat
                <br />
                (with roles USER SUPPORT ADMIN)
                <br />
              </h2>
              <h2>
                - created admin panel where ADMIN may
                <br /> add / edit /delete food
                <br />
              </h2>
              <h2>- setup for payment with paypal</h2>
              <h2>- setup for supabase</h2>
              <h2>
                - setup for orders delivery functionality
                <br /> with Google Maps API
              </h2>
              <h2>- setup for CHEF dashboard</h2>
              <h2> - developed frontend and backend</h2>
              <h2> - organized tasks in github projects</h2>
              <h2> - documented the project</h2>
              <h2>- created scalability for the project</h2>
            </div>
          }
        />
      }
    />
  )
}
