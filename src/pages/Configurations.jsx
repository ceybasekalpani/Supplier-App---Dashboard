import { useState } from 'react'
import { fertilizerTypes, itemTypes } from '../data/mockData'
import { Pencil, X, Check, Package, Flower2 } from 'lucide-react'

export default function Configurations() {
  const [tab, setTab] = useState('fertilizer')
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
  const [fertilizerList, setFertilizerList] = useState(fertilizerTypes)
  const [itemList, setItemList] = useState(itemTypes)
  
  const items = tab === 'fertilizer' ? fertilizerList : itemList
  
  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a name')
      return
    }
    
    if (editingId) {
      // Edit existing item
      const updateItem = { ...items.find(i => i.id === editingId), name: name.trim() }
      
      if (tab === 'fertilizer') {
        setFertilizerList(fertilizerList.map(i => i.id === editingId ? updateItem : i))
      } else {
        setItemList(itemList.map(i => i.id === editingId ? updateItem : i))
      }
      
      setSuccessMessage(`${name.trim()} updated successfully!`)
      setEditingId(null)
    } else {
      // Create new item
      const newItem = {
        id: Math.max(...items.map(i => i.id), 0) + 1,
        name: name.trim(),
        status: 'active'
      }
      
      if (tab === 'fertilizer') {
        setFertilizerList([...fertilizerList, newItem])
      } else {
        setItemList([...itemList, newItem])
      }
      
      setSuccessMessage(`${name.trim()} created successfully!`)
    }
    
    // Show success message
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
    
    // Reset form
    resetForm()
  }
  
  const handleEdit = (item) => {
    setName(item.name)
    setEditingId(item.id)
    // Scroll to form
    document.getElementById('create-form')?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const resetForm = () => {
    setName('')
    setEditingId(null)
  }
  
  const handleDiscard = () => {
    resetForm()
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Configurations Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage fertilizer types and inventory items</p>
        </div>
      
        
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-slide-down">
          <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <Check size={16} />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 w-fit shadow-sm">
        {['fertilizer', 'items'].map(t => (
          <button 
            key={t} 
            onClick={() => {
              setTab(t)
              resetForm()
            }}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200 flex items-center gap-2
              ${tab === t 
                ? 'bg-green-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
          >
            {t === 'fertilizer' ? <Flower2 size={14} /> : <Package size={14} />}
            {t}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: `Registered ${tab} types`, value: items.length, icon: Package, color: 'bg-blue-600' },
          { label: 'Current Mode', value: tab === 'fertilizer' ? 'Fertilizer' : 'Items', icon: tab === 'fertilizer' ? Flower2 : Package, color: 'bg-green-600' },
          { label: 'Setup Fields', value: 'Name', icon: Check, color: 'bg-slate-700' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center shadow-sm`}>
                <stat.icon size={18} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Table Section */}
        <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">
              {tab === 'fertilizer' ? 'Fertilizer Types' : 'Item Types'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-3 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <Package size={24} className="text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400">No {tab} found</p>
                <p className="text-sm text-slate-400 mt-1">Create your first {tab} type using the form</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    {['Type Name', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide py-3 px-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map(i => (
                    <tr 
                      key={i.id} 
                      className={`border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-150 ${
                        editingId === i.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {tab === 'fertilizer' ? <Flower2 size={14} className="text-green-600" /> : <Package size={14} className="text-blue-600" />}
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{i.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => handleEdit(i)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 transition-all duration-150 group"
                          title="Edit"
                        >
                          <Pencil size={14} className="group-hover:text-blue-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Form Section */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div id="create-form" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {editingId ? 'Edit' : 'Create'} {tab === 'fertilizer' ? 'Fertilizer' : 'Item'} Type
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingId ? 'Update the registered name' : 'Register a new name'}
                </p>
              </div>
              {editingId && (
                <button 
                  onClick={resetForm}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Cancel editing"
                >
                  <X size={14} className="text-slate-500" />
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                  Name *
                </label>
                <input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g., Organic Compost" 
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleDiscard} 
                  className="flex-1 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-150"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSave} 
                  className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md transition-all duration-150 flex items-center justify-center gap-2"
                >
                 
                  {editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
