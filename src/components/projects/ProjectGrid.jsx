
import { useNavigate } from "react-router-dom";
import ProjectCard from "./ProjectCard";

export default function ProjectGrid({ projects }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project, index) => {
        const projectId = project.projectId ?? project.id ?? project._id;

        return (
          <ProjectCard
            key={projectId}
            project={project}
            index={index}
            onClick={() => navigate(`/projects/${projectId}`)}
          />
        );
      })}
    </div>
  );
}
