"use client"
import { CollaborationIcon } from "@/components/CollaborationIcon"
import { ModalMoreInfo } from "@/components/Modals/ModalMoreInfo"
import { useModalsStore } from "@/store/modalsStore"

export default function ModalMoreInfo22() {
  const { isOpen, closeModal } = useModalsStore()
  return (
    <ModalMoreInfo
      isOpen={isOpen["16MoreInfo"]}
      onClose={() => closeModal("16MoreInfo")}
      label="16_gericht-restaurant"
      siteUrl="https://16-gericht-restaurant.vercel.app"
      taskLabel="Create site with high conversion rate for restaurant with booking system and delivery option"
      deadline="1 month"
      collaborationChildren={
        <>
          <CollaborationIcon
            imgSrc="/collaborations/16_gericht-restaurant/Kilomebit17.png"
            profileUrl="https://github.com/Kilomebit17"
            tooltiptext={<>Scroll in ModalMenu.tsx</>}
          />
          <CollaborationIcon tooltiptext={<>Whole site</>} />
        </>
      }
    />
  )
}
