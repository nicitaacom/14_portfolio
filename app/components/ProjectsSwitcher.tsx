"use client"

import { useState } from "react"

import { RadioButton } from "./RadioButton"
import {
  Project15,
  Project16,
  Project17,
  Project19,
  Project20,
  Project22,
  Project23,
  Project24,
  Project26,
  Project28,
  Project29,
  ProjectRizAdminDashboard,
} from "./Projects"
import { useModalsStore } from "@/store/modalsStore"

export function ProjectsSwitcher() {
  const [projectTab, setProjectTab] = useState<"work" | "projects" | "clones">("work")
  const { openModal } = useModalsStore()

  return (
    <>
      <div className="grid grid-cols-3 gap-x-md">
        <RadioButton
          label="Work"
          inputName="input-name"
          onChange={() => setProjectTab("work")}
          isChecked={projectTab === "work"}
        />
        <RadioButton
          label="Projects"
          inputName="input-name"
          onChange={() => setProjectTab("projects")}
          isChecked={projectTab === "projects"}
        />
        <RadioButton
          label="Clones"
          inputName="input-name"
          onChange={() => setProjectTab("clones")}
          isChecked={projectTab === "clones"}
        />
      </div>

      {projectTab === "work" ? (
        <>
          <ProjectRizAdminDashboard openModal={() => openModal("rizAdminDashboard")} />
        </>
      ) : projectTab === "projects" ? (
        <>
          <Project26 openModal={() => openModal("26MoreInfo")} />
          <Project23 openModal={() => openModal("23MoreInfo")} />
          <Project22 openModal={() => openModal("22MoreInfo")} />
          <Project24 openModal={() => openModal("24MoreInfo")} />
          <Project16 openModal={() => openModal("16MoreInfo")} />
          <Project15 openModal={() => openModal("15MoreInfo")} />
        </>
      ) : (
        projectTab === "clones" && (
          <>
            <Project28 openModal={() => openModal("28MoreInfo")} />
            <Project20 openModal={() => openModal("20MoreInfo")} />
            <Project19 openModal={() => openModal("19MoreInfo")} />
            <Project17 openModal={() => openModal("17MoreInfo")} />
            <Project29 openModal={() => openModal("29MoreInfo")} />
          </>
        )
      )}
    </>
  )
}
