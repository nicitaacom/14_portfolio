import {
  ModalMoreInfo15,
  ModalMoreInfo16,
  ModalMoreInfo17,
  ModalMoreInfo19,
  ModalMoreInfo20,
  ModalMoreInfo22,
  ModalMoreInfo23,
  ModalMoreInfo24,
  ModalMoreInfo26,
  ModalMoreInfo28,
  ModalMoreInfo29,
  ModalMoreInfoNDA,
  ModalMoreInfoRizAdminDashboard,
} from "./Projects/ModalsMoreInfo"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-[calc(100vh-72px)] overflow-x-clip transition-colors duration-300 pt-[62px]">
      {children}
      <ModalMoreInfoNDA />
      <ModalMoreInfo15 />
      <ModalMoreInfo16 />
      <ModalMoreInfo17 />
      <ModalMoreInfo19 />
      <ModalMoreInfo20 />
      <ModalMoreInfo22 />
      <ModalMoreInfo23 />
      <ModalMoreInfo24 />
      <ModalMoreInfo26 />
      <ModalMoreInfo28 />
      <ModalMoreInfo29 />
      <ModalMoreInfoRizAdminDashboard />
    </div>
  )
}
