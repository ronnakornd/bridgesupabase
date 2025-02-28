import React from "react";
import { BreadCrumbItem } from "@/types/breadcrump";

interface BreadcrumpProps {
  directory: BreadCrumbItem[];
}

function Breadcrump({ directory }: BreadcrumpProps) {
  return (
    <div className="breadcrumbs text-sm">
      <ul>
       {directory.map((link, index) => (
          <li key={index}>
            <a className={`${index == directory.length-1? 'font-semibold':''}`} href={link.href}>{link.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Breadcrump;
