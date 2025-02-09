
import React from 'react'
function BadgeLevel({ level }: Readonly<{ level: 'beginner' | 'intermediate' | 'advanced' }>) {
 
    const levelColor = {
        beginner: 'badge-success',
        intermediate: 'badge-warning',
        advanced: 'badge-error',
    };

  return (
    <div className={`badge ${levelColor[level]}`}>
      {level}
    </div>
  );
}

export default BadgeLevel;