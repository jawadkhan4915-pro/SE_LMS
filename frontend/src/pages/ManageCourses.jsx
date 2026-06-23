import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { BookOpen, Plus, Trash2, CheckCircle, UserPlus, Info } from 'lucide-react';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  // Course Form States
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [creditHours, setCreditHours] = useState('3');
  const [semester, setSemester] = useState('1');
  const [teacher, setTeacher] = useState('');
  const [category, setCategory] = useState('Core');
  const [department, setDepartment] = useState('SE');

  const fetchCoursesAndTeachers = async () => {
    try {
      const [coursesResponse, usersResponse] = await Promise.all([
        api.get('/courses/all'),
        api.get('/users?limit=100&role=teacher')
      ]);
      setCourses(coursesResponse.data.data);
      setTeachers(usersResponse.data.data);
      if (usersResponse.data.data.length > 0) {
        setTeacher(usersResponse.data.data[0]._id); // Default assign first teacher
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesAndTeachers();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!name || !code || !description || !teacher) {
      alert('Please fill in all course parameters');
      return;
    }

    try {
      await api.post('/courses', {
        name,
        code,
        description,
        creditHours: Number(creditHours),
        semester: Number(semester),
        teacher,
        category,
        department
      });
      setMessage('Course published successfully in curriculum.');
      setName('');
      setCode('');
      setDescription('');
      setDepartment('SE');
      setIsOpen(false);
      fetchCoursesAndTeachers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create course');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course module? This clears student grades and registration cascades.')) return;
    try {
      await api.delete(`/courses/${id}`);
      setMessage('Course removed.');
      fetchCoursesAndTeachers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-teal-400">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-teal-400" />
          <span>Curriculum Modules Management</span>
        </h2>
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Create Course</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Courses registry table listings */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/40 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="p-4">Code</th>
              <th className="p-4">Course Name</th>
              <th className="p-4">Credits</th>
              <th className="p-4">Assigned Instructor</th>
              <th className="p-4">Semester</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {courses.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500">No courses defined.</td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course._id} className="hover:bg-slate-900/10">
                  <td className="p-4 font-bold text-teal-400">
                    <span>{course.code}</span>
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-350 font-semibold">{course.department}</span>
                  </td>
                  <td className="p-4 text-slate-200">
                    <p className="font-bold">{course.name}</p>
                    <p className="text-[10px] text-slate-500 truncate max-w-xs">{course.description}</p>
                  </td>
                  <td className="p-4 text-slate-400">{course.creditHours} CH</td>
                  <td className="p-4 text-slate-300 font-medium">{course.teacher?.name}</td>
                  <td className="p-4 text-slate-400">Semester {course.semester}</td>
                  <td className="p-4 flex items-center justify-center gap-2">
                    <button 
                      onClick={() => handleDeleteCourse(course._id)}
                      className="h-7 w-7 rounded-lg bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/10 text-slate-500 hover:text-rose-400 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create course Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form 
            onSubmit={handleCreateCourse}
            className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-4"
          >
            <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-3">Configure New course Syllabus</h3>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Course Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Generative AI"
                  className="form-input text-xs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Course Code *</label>
                <input
                  type="text"
                  placeholder="e.g. SE-312"
                  className="form-input text-xs"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Course Description</label>
              <textarea
                placeholder="Write summary syllabus description..."
                className="form-input text-xs min-h-20 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Assigned Teacher *</label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500 text-xs"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  required
                >
                  {teachers.length === 0 ? (
                    <option value="">No teachers available - register one first</option>
                  ) : (
                    teachers.map(t => (
                      <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Course Category</label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500 text-xs"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Core">Core SE Module</option>
                  <option value="Elective">Elective SE Module</option>
                  <option value="AI">Artificial Intelligence Elective</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Credit Hours</label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500 text-xs"
                  value={creditHours}
                  onChange={(e) => setCreditHours(e.target.value)}
                >
                  {[1, 2, 3, 4].map(ch => (
                    <option key={ch} value={ch}>{ch} Credits</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Semester Placement</label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500 text-xs"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Department *</label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500 text-xs"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  <option value="SE">Software Engineering (SE)</option>
                  <option value="CS">Computer Science (CS)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="EE">Electrical Engineering (EE)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex-1"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={teachers.length === 0}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl flex-1 shadow-lg shadow-teal-500/10 disabled:opacity-50"
              >
                Publish Syllabus
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;
