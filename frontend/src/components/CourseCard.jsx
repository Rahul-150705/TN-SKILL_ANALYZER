export default function CourseCard({ course }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col h-full hover:border-emerald-500/50 transition">
      <div className="text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wide">
        {/* FIXED: was course.skillName — backend doesn't return this field */}
        {course.platform}
      </div>
      <h4 className="text-white font-medium mb-1 line-clamp-2">{course.courseName}</h4>
      {/* FIXED: was course.provider (doesn't exist) and course.durationWeeks (not in backend) */}
      <p className="text-slate-400 text-sm mb-4">{course.platform}</p>

      <div className="mt-auto">
        {/* FIXED: was course.courseUrl — backend returns course.courseLink */}
        <a href={course.courseLink} target="_blank" rel="noreferrer"
          className="w-full text-center block bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 font-medium py-2 px-4 rounded transition">
          Enroll Now
        </a>
      </div>
    </div>
  );
}