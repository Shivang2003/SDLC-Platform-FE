
import { useNavigate, useParams } from "react-router-dom";
import ProjectCard from "./ProjectCard";

export default function ProjectGrid({ projects }) {
  const navigate = useNavigate();
  const { organizationId } = useParams();

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project, index) => {
        const projectId = project.projectId ?? project.id ?? project._id;

        return (
          <ProjectCard
            key={projectId}
            project={project}
            index={index}
            onClick={() =>
              navigate(
                organizationId
                  ? `/organizations/${organizationId}/projects/${projectId}?view=projects`
                  : `/projects/${projectId}`,
                { state: { project } }
              )
            }
          />
        );
      })}
    </div>
  );
}
