import React from "react";

interface LinkProps {
  name: string;
  href?: string;
}

interface BreadcrumpProps {
  directory: LinkProps[];
}

function Breadcrump({ directory }: BreadcrumpProps) {
  return (
    <div className="breadcrumbs text-sm">
      <ul>
       {directory.map((link, index) => (
          <li key={index}>
            <a href={link.href}>{link.name}</a>
            </li>
        ))}
      </ul>
    </div>
  );
}

export default Breadcrump;
