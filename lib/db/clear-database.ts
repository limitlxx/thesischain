"use client"

/**
 * Utility to clear the RxDB database
 * Use this when schema changes require a fresh start
 */

export async function clearRxDatabase() {
  if (typeof window === 'undefined') {
    console.warn('clearRxDatabase can only run in browser')
    return
  }

  try {
    console.log('🗑️ Clearing RxDB database...')
    
    // Clear IndexedDB databases
    const databases = await window.indexedDB.databases()
    
    for (const db of databases) {
      if (db.name?.includes('thesischain') || db.name?.includes('rxdb')) {
        console.log(`Deleting database: ${db.name}`)
        await new Promise<void>((resolve, reject) => {
          const request = window.indexedDB.deleteDatabase(db.name!)
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
          request.onblocked = () => {
            console.warn(`Database ${db.name} is blocked, close all tabs and try again`)
            reject(new Error('Database blocked'))
          }
        })
      }
    }
    
    console.log('✅ RxDB database cleared successfully')
    console.log('🔄 Please refresh the page to reinitialize the database')
    
    return true
  } catch (error) {
    console.error('❌ Error clearing database:', error)
    return false
  }
}

/**
 * Clear database and reload page
 */
export async function clearAndReload() {
  const success = await clearRxDatabase()
  if (success) {
    window.location.reload()
  }
}
