import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

export function useProjects(userId) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all projects with their developers and reports
  const fetchProjects = useCallback(async () => {
    if (!userId) {
      setProjects([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (projectsError) throw projectsError

      // Fetch developers and reports for all projects
      const projectIds = projectsData.map(p => p.id)

      const [developersResult, reportsResult] = await Promise.all([
        supabase
          .from('developers')
          .select('*')
          .in('project_id', projectIds),
        supabase
          .from('reports')
          .select('*')
          .in('project_id', projectIds)
          .order('created_at', { ascending: true })
      ])

      if (developersResult.error) throw developersResult.error
      if (reportsResult.error) throw reportsResult.error

      // Combine data
      const fullProjects = projectsData.map(project => ({
        ...project,
        // Map DB columns to frontend format
        id: project.id,
        name: project.name,
        client: project.client || '',
        lead: project.lead || '',
        startDate: project.start_date || '',
        archived: project.archived || false,
        developers: (developersResult.data || [])
          .filter(d => d.project_id === project.id)
          .map(d => ({
            id: d.id,
            name: d.name,
            daysPerWeek: d.days_per_week || 5
          })),
        reports: (reportsResult.data || [])
          .filter(r => r.project_id === project.id)
          .map(r => ({
            id: r.id,
            fileName: r.file_name,
            pbiReportName: r.pbi_report_name || '',
            complexity: r.complexity || 'Simple',
            days: parseFloat(r.days) || 0.5,
            actualDays: r.actual_days ? parseFloat(r.actual_days) : '',
            status: r.status || 'not_started',
            assignedTo: r.assigned_to || '',
            notes: r.notes || '',
            dateCompleted: r.date_completed || '',
            signedOff: r.signed_off || false,
            signedOffBy: r.signed_off_by || '',
            signedOffDate: r.signed_off_date || '',
            sql: r.sql_query || '',
            fieldAliases: r.field_aliases || [],
            parameters: r.parameters || [],
            formulas: r.formulas || [],
            tables: r.tables || [],
            hasVBA: r.has_vba || false
          }))
      }))

      setProjects(fullProjects)
      setError(null)
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Create a new project
  const createProject = async (projectData) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          name: projectData.name,
          client: projectData.client || null,
          lead: projectData.lead || null,
          start_date: projectData.startDate || null,
          archived: false
        })
        .select()
        .single()

      if (error) throw error

      // Insert developers if any
      if (projectData.developers?.length > 0) {
        const { error: devError } = await supabase
          .from('developers')
          .insert(
            projectData.developers
              .filter(d => d.name.trim())
              .map(d => ({
                project_id: data.id,
                name: d.name,
                days_per_week: d.daysPerWeek || 5
              }))
          )
        if (devError) throw devError
      }

      await fetchProjects()
      return { data, error: null }
    } catch (err) {
      console.error('Error creating project:', err)
      return { data: null, error: err }
    }
  }

  // Update a project
  const updateProject = async (projectId, projectData) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: projectData.name,
          client: projectData.client || null,
          lead: projectData.lead || null,
          start_date: projectData.startDate || null,
          archived: projectData.archived || false,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)

      if (error) throw error

      // Delete existing developers and re-insert
      await supabase
        .from('developers')
        .delete()
        .eq('project_id', projectId)

      if (projectData.developers?.length > 0) {
        const { error: devError } = await supabase
          .from('developers')
          .insert(
            projectData.developers
              .filter(d => d.name.trim())
              .map(d => ({
                project_id: projectId,
                name: d.name,
                days_per_week: d.daysPerWeek || 5
              }))
          )
        if (devError) throw devError
      }

      await fetchProjects()
      return { error: null }
    } catch (err) {
      console.error('Error updating project:', err)
      return { error: err }
    }
  }

  // Delete a project
  const deleteProject = async (projectId) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error

      await fetchProjects()
      return { error: null }
    } catch (err) {
      console.error('Error deleting project:', err)
      return { error: err }
    }
  }

  // Archive/unarchive a project
  const toggleArchive = async (projectId) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return { error: new Error('Project not found') }

    try {
      const { error } = await supabase
        .from('projects')
        .update({ archived: !project.archived })
        .eq('id', projectId)

      if (error) throw error

      await fetchProjects()
      return { error: null }
    } catch (err) {
      console.error('Error toggling archive:', err)
      return { error: err }
    }
  }

  // Duplicate a project
  const duplicateProject = async (projectId) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return { error: new Error('Project not found') }

    try {
      // Create new project
      const { data: newProject, error: createError } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          name: `${project.name} (Copy)`,
          client: project.client || null,
          lead: project.lead || null,
          start_date: project.startDate || null,
          archived: false
        })
        .select()
        .single()

      if (createError) throw createError

      // Copy developers
      if (project.developers?.length > 0) {
        await supabase
          .from('developers')
          .insert(
            project.developers.map(d => ({
              project_id: newProject.id,
              name: d.name,
              days_per_week: d.daysPerWeek || 5
            }))
          )
      }

      // Copy reports (reset status)
      if (project.reports?.length > 0) {
        await supabase
          .from('reports')
          .insert(
            project.reports.map(r => ({
              project_id: newProject.id,
              file_name: r.fileName,
              pbi_report_name: r.pbiReportName || null,
              complexity: r.complexity,
              days: r.days,
              actual_days: null,
              status: 'not_started',
              assigned_to: null,
              notes: null,
              date_completed: null,
              signed_off: false,
              signed_off_by: null,
              signed_off_date: null,
              sql_query: r.sql || null,
              field_aliases: r.fieldAliases || [],
              parameters: r.parameters || [],
              formulas: r.formulas || [],
              tables: r.tables || [],
              has_vba: r.hasVBA || false
            }))
          )
      }

      await fetchProjects()
      return { data: newProject, error: null }
    } catch (err) {
      console.error('Error duplicating project:', err)
      return { error: err }
    }
  }

  // Add reports to a project
  const addReports = async (projectId, reports) => {
    try {
      const { error } = await supabase
        .from('reports')
        .insert(
          reports.map(r => ({
            project_id: projectId,
            file_name: r.fileName,
            pbi_report_name: r.pbiReportName || null,
            complexity: r.complexity,
            days: r.days,
            actual_days: r.actualDays || null,
            status: r.status || 'not_started',
            assigned_to: r.assignedTo || null,
            notes: r.notes || null,
            date_completed: r.dateCompleted || null,
            signed_off: r.signedOff || false,
            signed_off_by: r.signedOffBy || null,
            signed_off_date: r.signedOffDate || null,
            sql_query: r.sql || null,
            field_aliases: r.fieldAliases || [],
            parameters: r.parameters || [],
            formulas: r.formulas || [],
            tables: r.tables || [],
            has_vba: r.hasVBA || false
          }))
        )

      if (error) throw error

      await fetchProjects()
      return { error: null }
    } catch (err) {
      console.error('Error adding reports:', err)
      return { error: err }
    }
  }

  // Update a single report
  const updateReport = async (reportId, field, value) => {
    // Map frontend field names to DB column names
    const fieldMap = {
      pbiReportName: 'pbi_report_name',
      actualDays: 'actual_days',
      assignedTo: 'assigned_to',
      dateCompleted: 'date_completed',
      signedOff: 'signed_off',
      signedOffBy: 'signed_off_by',
      signedOffDate: 'signed_off_date',
      status: 'status',
      notes: 'notes',
      complexity: 'complexity',
      days: 'days'
    }

    const dbField = fieldMap[field] || field

    try {
      const { error } = await supabase
        .from('reports')
        .update({
          [dbField]: value === '' ? null : value,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)

      if (error) throw error

      // Update local state without full refetch for better UX
      setProjects(prev => prev.map(project => ({
        ...project,
        reports: project.reports.map(r =>
          r.id === reportId ? { ...r, [field]: value } : r
        )
      })))

      return { error: null }
    } catch (err) {
      console.error('Error updating report:', err)
      return { error: err }
    }
  }

  // Delete a report
  const deleteReport = async (reportId) => {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)

      if (error) throw error

      // Update local state
      setProjects(prev => prev.map(project => ({
        ...project,
        reports: project.reports.filter(r => r.id !== reportId)
      })))

      return { error: null }
    } catch (err) {
      console.error('Error deleting report:', err)
      return { error: err }
    }
  }

  // Bulk update reports
  const bulkUpdateReports = async (reportIds, field, value) => {
    const fieldMap = {
      status: 'status',
      assignedTo: 'assigned_to'
    }
    const dbField = fieldMap[field] || field

    try {
      const { error } = await supabase
        .from('reports')
        .update({
          [dbField]: value === '' ? null : value,
          updated_at: new Date().toISOString()
        })
        .in('id', reportIds)

      if (error) throw error

      // Update local state
      setProjects(prev => prev.map(project => ({
        ...project,
        reports: project.reports.map(r =>
          reportIds.includes(r.id) ? { ...r, [field]: value } : r
        )
      })))

      return { error: null }
    } catch (err) {
      console.error('Error bulk updating reports:', err)
      return { error: err }
    }
  }

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    toggleArchive,
    duplicateProject,
    addReports,
    updateReport,
    deleteReport,
    bulkUpdateReports
  }
}
