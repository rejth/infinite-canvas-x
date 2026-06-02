import { BaseStore } from '@infinite-canvas-x/indexed-db-store'

import { StoreName } from '../interfaces'

class TestStore extends BaseStore {
  constructor(db: IDBDatabase) {
    super(db, StoreName.CANVAS_STATE)
  }
}

interface TestData {
  name: string
  value: number
  category: string
}

type TestDataWithId = Record<string, unknown> & TestData & { id: number }

const mockTestData: TestData[] = [
  { name: 'Item 1', value: 10, category: 'A' },
  { name: 'Item 2', value: 20, category: 'B' },
  { name: 'Item 3', value: 30, category: 'A' },
  { name: 'Item 4', value: 40, category: 'C' },
  { name: 'Item 5', value: 50, category: 'B' },
]

async function cleanupPreviousTestDBs(): Promise<void> {
  console.log('🧹 Cleaning up previous test databases...')

  try {
    // Get all databases
    if ('databases' in indexedDB) {
      const databases = await indexedDB.databases()
      const testDBs = databases.filter((db) => db.name?.startsWith('TestDB_'))

      if (testDBs.length === 0) {
        console.log('✨ No previous test databases found.')
        return
      }

      console.log(
        `🗑️ Found ${testDBs.length} test databases to clean up:`,
        testDBs.map((db) => db.name),
      )

      for (const db of testDBs) {
        if (db.name) {
          await new Promise<void>((resolve, reject) => {
            const deleteReq = indexedDB.deleteDatabase(db.name!)
            deleteReq.onsuccess = () => {
              console.log(`✅ Deleted database: ${db.name}`)
              resolve()
            }
            deleteReq.onerror = () => {
              console.error(`❌ Failed to delete database: ${db.name}`, deleteReq.error)
              reject(deleteReq.error)
            }
            deleteReq.onblocked = () => {
              console.warn(`⚠️ Delete blocked for database: ${db.name} (may have open connections)`)
              // Still resolve as the delete will complete when connections close
              resolve()
            }
          })
        }
      }

      console.log('🎯 Database cleanup completed!\n')
    } else {
      console.log(
        '⚠️ indexedDB.databases() not supported in this environment. Manual cleanup not possible.\n',
      )
    }
  } catch (error) {
    console.error('❌ Failed to cleanup previous test databases:', error)
    // Don't throw - continue with tests even if cleanup fails
  }
}

async function createMockDB(): Promise<IDBDatabase> {
  const dbName = `TestDB_${Date.now()}_${Math.random()}`

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(StoreName.CANVAS_STATE)) {
        db.createObjectStore(StoreName.CANVAS_STATE, { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}

async function populateTestData(store: TestStore): Promise<void> {
  console.log('📚 Populating test data...')

  await store.clear()

  for (const item of mockTestData) {
    try {
      const result = await store.add(item)
      console.log(`✅ Added item: ${item.name} with id: ${result}`)
    } catch (error) {
      console.error(`❌ Failed to add item ${item.name}:`, error)
      throw error
    }
  }

  const count = await store.count()
  console.log(`📊 Total items in store: ${count}\n`)
}

async function testMapAll() {
  console.log('🧪 Testing mapAll function...')
  console.log('=====================================')

  try {
    const db = await createMockDB()
    const store = new TestStore(db)

    await populateTestData(store)

    const mappers = [
      (item: TestDataWithId) => ({ ...item, mapped: true, timestamp: Date.now() }),
      (item: TestDataWithId) => ({
        id: item.id,
        uppercaseName: item.name.toUpperCase(),
        originalValue: item.value,
      }),
      (item: TestDataWithId) => ({ simpleValue: item.value * 2, category: item.category }),
    ]

    console.log('📝 Number of mappers:', mappers.length)
    console.log('📊 Testing mapAll with multiple mappers...')

    const results: unknown[] = []
    let resultCount = 0

    for await (const result of store.mapAll<TestDataWithId, unknown>(mappers)) {
      resultCount++
      console.log(`✅ Mapped result #${resultCount}:`, JSON.stringify(result, null, 2))
      results.push(result)
    }

    console.log(`🎯 Total mapped results: ${results.length}`)
    console.log(`📈 Expected results: ${mockTestData.length * mappers.length}`)
    console.log('✨ mapAll test completed successfully!\n')

    db.close()
  } catch (error) {
    console.error('❌ mapAll test failed:', error)
  }
}

async function testFindAllBy() {
  console.log('🔍 Testing findAllBy function...')
  console.log('=====================================')

  try {
    const db = await createMockDB()
    const store = new TestStore(db)

    await populateTestData(store)

    const predicate = (item: TestData) => {
      console.log(
        `🔎 Checking item: ${item.name} (value: ${item.value}) - ${item.value > 25 ? 'MATCH' : 'NO MATCH'}`,
      )
      return item.value > 25
    }

    console.log('📝 Predicate: value > 25')
    console.log('📊 Testing findAllBy with predicate...')

    const results: TestDataWithId[] = []
    let itemCount = 0

    for await (const result of store.findAllBy<TestDataWithId>(predicate)) {
      itemCount++
      console.log(`✅ Found item #${itemCount}:`, JSON.stringify(result, null, 2))
      results.push(result)
    }

    console.log(`🎯 Total found items: ${results.length}`)
    console.log('✨ findAllBy test completed successfully!\n')

    db.close()
  } catch (error) {
    console.error('❌ findAllBy test failed:', error)
  }
}

async function testTakeByLimit() {
  console.log('📏 Testing takeByLimit function...')
  console.log('=====================================')

  try {
    const db = await createMockDB()
    const store = new TestStore(db)

    await populateTestData(store)

    const limit = 3

    console.log(`📝 Limit: ${limit}`)
    console.log('📊 Testing takeByLimit...')

    const results: TestDataWithId[] = []
    let itemCount = 0

    for await (const result of store.takeByLimit<TestDataWithId>(limit)) {
      itemCount++
      console.log(`✅ Taken item #${itemCount}:`, JSON.stringify(result, null, 2))
      results.push(result)

      if (itemCount >= limit) {
        console.log('⏹️ Reached limit, should stop here')
      }
    }

    console.log(`🎯 Total taken items: ${results.length}`)
    console.log(
      `✅ Expected: ${limit}, Actual: ${results.length} - ${results.length === limit ? 'PASS' : 'FAIL'}`,
    )
    console.log('✨ takeByLimit test completed successfully!\n')

    db.close()
  } catch (error) {
    console.error('❌ takeByLimit test failed:', error)
  }
}

async function testReduce() {
  console.log('🔍📝 Testing reduce function...')
  console.log('=====================================')

  try {
    const db = await createMockDB()
    const store = new TestStore(db)

    await populateTestData(store)

    const predicate = (item: TestDataWithId) => {
      const isMatch = item.category === 'A'
      console.log(
        `🔎 Checking item: ${item.name} (category: ${item.category}) - ${isMatch ? 'MATCH' : 'NO MATCH'}`,
      )
      return isMatch
    }

    const mappers = [
      (item: TestDataWithId) => ({
        ...item,
        categoryA: true,
        processedAt: new Date().toISOString(),
      }),
      (item: TestDataWithId) => ({
        id: item.id,
        name: item.name,
        doubleValue: item.value * 2,
        category: item.category,
        isSpecial: true,
      }),
    ]

    console.log('📝 Predicate: category === "A"')
    console.log('📝 Mappers count:', mappers.length)
    console.log('📊 Testing findAndMapAllBy...')

    const results: unknown[] = []
    let resultCount = 0

    for await (const result of store.reduce<TestDataWithId, unknown>(predicate, mappers)) {
      resultCount++
      console.log(`✅ Found and mapped result #${resultCount}:`, JSON.stringify(result, null, 2))
      results.push(result)
    }

    const expectedCategoryAItems = mockTestData.filter((item) => item.category === 'A').length
    const expectedResults = expectedCategoryAItems * mappers.length

    console.log(`🎯 Total found and mapped results: ${results.length}`)
    console.log(
      `📈 Expected results: ${expectedResults} (${expectedCategoryAItems} category A items × ${mappers.length} mappers)`,
    )
    console.log('✨ findAndMapAllBy test completed successfully!\n')

    db.close()
  } catch (error) {
    console.error('❌ findAndMapAllBy test failed:', error)
  }
}

async function testSlice() {
  console.log('✂️ Testing slice function...')
  console.log('=====================================')

  try {
    const db = await createMockDB()
    const store = new TestStore(db)

    await populateTestData(store)

    console.log('📝 Test 1: slice(start=1, stop=4, step=1)')
    console.log('📊 Expected: Items 2, 3, 4 (indices 1-3)')

    const results1: TestDataWithId[] = []
    let itemCount1 = 0

    for await (const result of store.sliceBy<TestDataWithId>(1, 4, 1)) {
      itemCount1++
      console.log(`✅ Sliced item #${itemCount1}:`, JSON.stringify(result, null, 2))
      results1.push(result)
    }

    console.log(`🎯 Total sliced items: ${results1.length}`)
    console.log(
      `✅ Expected: 3, Actual: ${results1.length} - ${results1.length === 3 ? 'PASS' : 'FAIL'}\n`,
    )

    console.log('📝 Test 2: slice(start=0, stop=5, step=2)')
    console.log('📊 Expected: Items 1, 3, 5 (every 2nd item from index 0-4)')

    const results2: TestDataWithId[] = []
    let itemCount2 = 0

    for await (const result of store.sliceBy<TestDataWithId>(0, 5, 2)) {
      itemCount2++
      console.log(`✅ Sliced item #${itemCount2}:`, JSON.stringify(result, null, 2))
      results2.push(result)
    }

    console.log(`🎯 Total sliced items: ${results2.length}`)
    console.log(
      `✅ Expected: 3, Actual: ${results2.length} - ${results2.length === 3 ? 'PASS' : 'FAIL'}\n`,
    )

    console.log('📝 Test 3: slice(start=2, stop=10, step=1)')
    console.log('📊 Expected: Items 3, 4, 5 (all remaining items from index 2)')

    const results3: TestDataWithId[] = []
    let itemCount3 = 0

    for await (const result of store.sliceBy<TestDataWithId>(2, 10, 1)) {
      itemCount3++
      console.log(`✅ Sliced item #${itemCount3}:`, JSON.stringify(result, null, 2))
      results3.push(result)
    }

    console.log(`🎯 Total sliced items: ${results3.length}`)
    console.log(
      `✅ Expected: 3, Actual: ${results3.length} - ${results3.length === 3 ? 'PASS' : 'FAIL'}\n`,
    )

    console.log('📝 Test 4: slice(start=3, stop=3, step=1)')
    console.log('📊 Expected: No items (empty slice)')

    const results4: TestDataWithId[] = []
    let itemCount4 = 0

    for await (const result of store.sliceBy<TestDataWithId>(3, 3, 1)) {
      itemCount4++
      console.log(`✅ Sliced item #${itemCount4}:`, JSON.stringify(result, null, 2))
      results4.push(result)
    }

    console.log(`🎯 Total sliced items: ${results4.length}`)
    console.log(
      `✅ Expected: 0, Actual: ${results4.length} - ${results4.length === 0 ? 'PASS' : 'FAIL'}\n`,
    )

    console.log('✨ slice test completed successfully!\n')

    db.close()
  } catch (error) {
    console.error('❌ slice test failed:', error)
  }
}

async function testUpdate() {
  console.log('📝 Testing update function...')
  console.log('=====================================')

  try {
    const db = await createMockDB()
    const store = new TestStore(db)

    await populateTestData(store)

    // Test updating a single item
    console.log('📊 Testing update with specific id...')

    // Get the first item to update
    const allItems = await store.getAll<TestDataWithId>()
    const firstItem = allItems[0]
    console.log('📋 Original item:', JSON.stringify(firstItem, null, 2))

    // Update the item
    const updateData = { name: 'Updated Item 1', value: 999 }
    console.log('📝 Updating with:', JSON.stringify(updateData, null, 2))

    store.update<TestDataWithId>(firstItem.id, updateData)

    // Verify the update
    const updatedItem = await store.get<TestDataWithId>(firstItem.id)
    console.log('✅ Updated item:', JSON.stringify(updatedItem, null, 2))

    const isUpdated =
      updatedItem?.name === updateData.name && updatedItem?.value === updateData.value
    console.log(`🎯 Update successful: ${isUpdated ? 'PASS' : 'FAIL'}`)

    console.log('✨ update test completed successfully!\n')

    db.close()
  } catch (error) {
    console.error('❌ update test failed:', error)
  }
}

async function testUpdateAll() {
  console.log('📝 Testing updateAll function...')
  console.log('=====================================')

  try {
    const db = await createMockDB()
    const store = new TestStore(db)

    await populateTestData(store)

    // Get all items before update
    const originalItems = await store.getAll<TestDataWithId>()
    console.log(`📊 Original items count: ${originalItems.length}`)

    // Update all items
    const updateData = { category: 'UPDATED_CATEGORY' }
    console.log('📝 Updating all items with:', JSON.stringify(updateData, null, 2))

    store.updateAll<TestDataWithId>(updateData)

    // Verify all items are updated
    const updatedItems = await store.getAll<TestDataWithId>()
    console.log(`📊 Updated items count: ${updatedItems.length}`)

    const allUpdated = updatedItems.every((item) => item.category === updateData.category)
    console.log(`🎯 All items updated: ${allUpdated ? 'PASS' : 'FAIL'}`)

    console.log('Sample updated items:')
    updatedItems.slice(0, 3).forEach((item, index) => {
      console.log(`  ${index + 1}. ${JSON.stringify(item, null, 2)}`)
    })

    console.log('✨ updateAll test completed successfully!\n')

    db.close()
  } catch (error) {
    console.error('❌ updateAll test failed:', error)
  }
}

async function testUpdateAllByPath() {
  console.log('📝 Testing updateAllByPath function...')
  console.log('=====================================')

  try {
    const db = await createMockDB()
    const store = new TestStore(db)

    await populateTestData(store)

    // Get all items before update
    const originalItems = await store.getAll<TestDataWithId>()
    console.log(`📊 Original items count: ${originalItems.length}`)
    console.log('📋 Sample original item:', JSON.stringify(originalItems[0], null, 2))

    // Update all items using path
    const path = 'value'
    const newValue = 888
    console.log(`📝 Updating all items at path '${path}' with value: ${newValue}`)

    store.updateAllByPath(path, newValue)

    // Verify all items are updated
    const updatedItems = await store.getAll<TestDataWithId>()
    console.log(`📊 Updated items count: ${updatedItems.length}`)

    const allUpdated = updatedItems.every((item) => item.value === newValue)
    console.log(`🎯 All items updated at path: ${allUpdated ? 'PASS' : 'FAIL'}`)

    console.log('Sample updated items:')
    updatedItems.slice(0, 3).forEach((item, index) => {
      console.log(`  ${index + 1}. ${JSON.stringify(item, null, 2)}`)
    })

    // Test nested path update (if we had nested objects)
    console.log('\n📝 Testing nested path update...')
    // First add an item with nested structure
    const nestedItem = {
      name: 'Nested Item',
      value: 100,
      category: 'TEST',
      metadata: { priority: 'low', tags: ['test'] },
    }

    const nestedId = await store.add(nestedItem)
    console.log('📋 Added nested item with id:', nestedId)

    // Update nested path
    const nestedPath = 'metadata.priority'
    const nestedValue = 'high'
    console.log(`📝 Updating nested path '${nestedPath}' with value: ${nestedValue}`)

    store.updateAllByPath(nestedPath, nestedValue)

    // Verify nested update
    const itemWithNested = await store.get<typeof nestedItem>(nestedId)
    console.log('✅ Updated nested item:', JSON.stringify(itemWithNested, null, 2))

    const nestedUpdated = itemWithNested?.metadata?.priority === nestedValue
    console.log(`🎯 Nested path updated: ${nestedUpdated ? 'PASS' : 'FAIL'}`)

    console.log('✨ updateAllByPath test completed successfully!\n')

    db.close()
  } catch (error) {
    console.error('❌ updateAllByPath test failed:', error)
  }
}

async function testUpdateByPath() {
  console.log('📝 Testing updateByPath function...')
  console.log('=====================================')

  try {
    const db = await createMockDB()
    const store = new TestStore(db)

    await populateTestData(store)

    // Get the first item to update
    const allItems = await store.getAll<TestDataWithId>()
    const firstItem = allItems[0]
    console.log('📋 Original item:', JSON.stringify(firstItem, null, 2))

    // Update using path
    const path = 'name'
    const newValue = 'Updated by Path'
    console.log(`📝 Updating item ${firstItem.id} at path '${path}' with value: ${newValue}`)

    store.updateByPath(firstItem.id, path, newValue)

    // Verify the update
    const updatedItem = await store.get<TestDataWithId>(firstItem.id)
    console.log('✅ Updated item:', JSON.stringify(updatedItem, null, 2))

    const isUpdated = updatedItem?.name === newValue
    console.log(`🎯 Path update successful: ${isUpdated ? 'PASS' : 'FAIL'}`)

    // Test nested path update
    console.log('\n📝 Testing nested path update for specific item...')

    // Add an item with nested structure
    const nestedItem = {
      name: 'Specific Nested Item',
      value: 200,
      category: 'SPECIFIC',
      settings: { theme: 'dark', notifications: true },
    }

    const nestedId = await store.add(nestedItem)
    console.log('📋 Added nested item with id:', nestedId)

    // Update nested path for specific item
    const nestedPath = 'settings.theme'
    const nestedValue = 'light'
    console.log(
      `📝 Updating item ${nestedId} at nested path '${nestedPath}' with value: ${nestedValue}`,
    )

    store.updateByPath(nestedId, nestedPath, nestedValue)

    // Verify nested update
    const itemWithNestedUpdate = await store.get<typeof nestedItem>(nestedId)
    console.log('✅ Updated nested item:', JSON.stringify(itemWithNestedUpdate, null, 2))

    const nestedUpdated = itemWithNestedUpdate?.settings?.theme === nestedValue
    console.log(`🎯 Nested path updated for specific item: ${nestedUpdated ? 'PASS' : 'FAIL'}`)

    // Verify other items were not affected
    const otherItems = await store.getAll<typeof nestedItem & { id: IDBValidKey }>()
    const unaffectedItems = otherItems.filter(
      (item) => item.id !== nestedId && item.settings?.theme !== nestedValue,
    )
    console.log(
      `🎯 Other items unaffected: ${unaffectedItems.length === otherItems.length - 1 ? 'PASS' : 'FAIL'}`,
    )

    console.log('✨ updateByPath test completed successfully!\n')

    db.close()
  } catch (error) {
    console.error('❌ updateByPath test failed:', error)
  }
}

async function testCount() {
  console.log('🔢 Testing count function...')
  console.log('=====================================')

  try {
    const db = await createMockDB()
    const store = new TestStore(db)

    // Test count on empty store
    const emptyCount = await store.count()
    console.log(`📊 Empty store count: ${emptyCount}`)
    console.log(`🎯 Empty count correct: ${emptyCount === 0 ? 'PASS' : 'FAIL'}`)

    // Add some data and test count
    await populateTestData(store)
    const populatedCount = await store.count()
    console.log(`📊 Populated store count: ${populatedCount}`)
    console.log(
      `🎯 Populated count correct: ${populatedCount === mockTestData.length ? 'PASS' : 'FAIL'}`,
    )

    console.log('✨ count test completed successfully!\n')
    db.close()
  } catch (error) {
    console.error('❌ count test failed:', error)
  }
}

async function testGet() {
  console.log('🔍 Testing get function...')
  console.log('=====================================')

  try {
    const db = await createMockDB()
    const store = new TestStore(db)

    await populateTestData(store)

    // Get all items to find valid IDs
    const allItems = await store.getAll<TestDataWithId>()
    const firstItem = allItems[0]

    // Test getting existing item
    const retrievedItem = await store.get<TestDataWithId>(firstItem.id)
    console.log(`📋 Retrieved item:`, JSON.stringify(retrievedItem, null, 2))
    console.log(
      `🎯 Retrieved item matches: ${JSON.stringify(retrievedItem) === JSON.stringify(firstItem) ? 'PASS' : 'FAIL'}`,
    )

    // Test getting non-existent item
    const nonExistentItem = await store.get<TestDataWithId>(999999)
    console.log(`📋 Non-existent item result: ${nonExistentItem}`)
    console.log(`🎯 Non-existent item handling: ${nonExistentItem === undefined ? 'PASS' : 'FAIL'}`)

    console.log('✨ get test completed successfully!\n')
    db.close()
  } catch (error) {
    console.error('❌ get test failed:', error)
  }
}

async function testAdd() {
  console.log('➕ Testing add function...')
  console.log('=====================================')

  try {
    const db = await createMockDB()
    const store = new TestStore(db)

    await store.clear()

    // Test adding single item
    const newItem = { name: 'Test Add Item', value: 999, category: 'TEST' }
    const addedId = await store.add(newItem)
    console.log(`📋 Added item with ID: ${addedId}`)

    // Verify item was added
    const retrievedItem = await store.get<TestDataWithId>(addedId)
    console.log(`📋 Retrieved added item:`, JSON.stringify(retrievedItem, null, 2))
    console.log(
      `🎯 Item added correctly: ${retrievedItem?.name === newItem.name ? 'PASS' : 'FAIL'}`,
    )

    // Test count after add
    const countAfterAdd = await store.count()
    console.log(`📊 Count after add: ${countAfterAdd}`)
    console.log(`🎯 Count updated correctly: ${countAfterAdd === 1 ? 'PASS' : 'FAIL'}`)

    console.log('✨ add test completed successfully!\n')
    db.close()
  } catch (error) {
    console.error('❌ add test failed:', error)
  }
}

async function testPut() {
  console.log('📝 Testing put function...')
  console.log('=====================================')

  try {
    const db = await createMockDB()
    const store = new TestStore(db)

    await store.clear()

    // Test putting new item
    const newItem = { id: 1, name: 'Test Put Item', value: 777, category: 'PUT' }
    const putId = await store.put(newItem)
    console.log(`📋 Put item with ID: ${putId}`)

    // Verify item was put
    const retrievedItem = await store.get<TestDataWithId>(putId)
    console.log(`📋 Retrieved put item:`, JSON.stringify(retrievedItem, null, 2))
    console.log(`🎯 Item put correctly: ${retrievedItem?.name === newItem.name ? 'PASS' : 'FAIL'}`)

    // Test updating existing item with put
    const updatedItem = { id: 1, name: 'Updated Put Item', value: 888, category: 'UPDATED' }
    const updateId = await store.put(updatedItem)
    console.log(`📋 Updated item with ID: ${updateId}`)

    // Verify item was updated
    const updatedRetrievedItem = await store.get<TestDataWithId>(updateId)
    console.log(`📋 Retrieved updated item:`, JSON.stringify(updatedRetrievedItem, null, 2))
    console.log(
      `🎯 Item updated correctly: ${updatedRetrievedItem?.name === updatedItem.name ? 'PASS' : 'FAIL'}`,
    )

    // Verify count is still 1 (updated, not added)
    const countAfterUpdate = await store.count()
    console.log(`📊 Count after update: ${countAfterUpdate}`)
    console.log(`🎯 Count correct after update: ${countAfterUpdate === 1 ? 'PASS' : 'FAIL'}`)

    console.log('✨ put test completed successfully!\n')
    db.close()
  } catch (error) {
    console.error('❌ put test failed:', error)
  }
}

async function testDelete() {
  console.log('🗑️ Testing delete function...')
  console.log('=====================================')

  try {
    const db = await createMockDB()
    const store = new TestStore(db)

    await populateTestData(store)

    // Get initial count
    const initialCount = await store.count()
    console.log(`📊 Initial count: ${initialCount}`)

    // Get an item to delete
    const allItems = await store.getAll<TestDataWithId>()
    const itemToDelete = allItems[0]
    console.log(`📋 Item to delete:`, JSON.stringify(itemToDelete, null, 2))

    // Delete the item
    await store.delete(itemToDelete.id)
    console.log(`🗑️ Deleted item with ID: ${itemToDelete.id}`)

    // Verify item was deleted
    const deletedItem = await store.get<TestDataWithId>(itemToDelete.id)
    console.log(`📋 Deleted item result: ${deletedItem}`)
    console.log(`🎯 Item deleted correctly: ${deletedItem === undefined ? 'PASS' : 'FAIL'}`)

    // Verify count decreased
    const countAfterDelete = await store.count()
    console.log(`📊 Count after delete: ${countAfterDelete}`)
    console.log(
      `🎯 Count updated correctly: ${countAfterDelete === initialCount - 1 ? 'PASS' : 'FAIL'}`,
    )

    console.log('✨ delete test completed successfully!\n')
    db.close()
  } catch (error) {
    console.error('❌ delete test failed:', error)
  }
}

async function testBulkAdd() {
  console.log('📦 Testing bulkAdd function...')
  console.log('=====================================')

  try {
    const db = await createMockDB()
    const store = new TestStore(db)

    await store.clear()

    // Test bulk adding items
    const bulkItems = [
      { name: 'Bulk Item 1', value: 100, category: 'BULK' },
      { name: 'Bulk Item 2', value: 200, category: 'BULK' },
      { name: 'Bulk Item 3', value: 300, category: 'BULK' },
    ]

    const bulkIds = await store.bulkAdd(bulkItems)
    console.log(`📋 Bulk added items with IDs:`, bulkIds)
    console.log(
      `🎯 Bulk add returned correct count: ${bulkIds.length === bulkItems.length ? 'PASS' : 'FAIL'}`,
    )

    // Verify all items were added
    const allItems = await store.getAll<TestDataWithId>()
    console.log(`📊 Total items after bulk add: ${allItems.length}`)
    console.log(`🎯 All items added: ${allItems.length === bulkItems.length ? 'PASS' : 'FAIL'}`)

    // Verify count
    const count = await store.count()
    console.log(`📊 Count after bulk add: ${count}`)
    console.log(`🎯 Count correct: ${count === bulkItems.length ? 'PASS' : 'FAIL'}`)

    console.log('✨ bulkAdd test completed successfully!\n')
    db.close()
  } catch (error) {
    console.error('❌ bulkAdd test failed:', error)
  }
}

async function testBulkPut() {
  console.log('📦📝 Testing bulkPut function...')
  console.log('=====================================')

  try {
    const db = await createMockDB()
    const store = new TestStore(db)

    await store.clear()

    // Test bulk putting items
    const bulkItems = [
      { id: 1, name: 'Bulk Put Item 1', value: 111, category: 'BULK_PUT' },
      { id: 2, name: 'Bulk Put Item 2', value: 222, category: 'BULK_PUT' },
      { id: 3, name: 'Bulk Put Item 3', value: 333, category: 'BULK_PUT' },
    ]

    const bulkIds = await store.bulkPut(bulkItems)
    console.log(`📋 Bulk put items with IDs:`, bulkIds)
    console.log(
      `🎯 Bulk put returned correct count: ${bulkIds.length === bulkItems.length ? 'PASS' : 'FAIL'}`,
    )

    // Test updating existing items with bulk put
    const updatedBulkItems = [
      { id: 1, name: 'Updated Bulk Put Item 1', value: 1111, category: 'UPDATED_BULK' },
      { id: 2, name: 'Updated Bulk Put Item 2', value: 2222, category: 'UPDATED_BULK' },
    ]

    const updateIds = await store.bulkPut(updatedBulkItems)
    console.log(`📋 Bulk updated items with IDs:`, updateIds)

    // Verify updates
    const updatedItem = await store.get<TestDataWithId>(1)
    console.log(`📋 Updated item:`, JSON.stringify(updatedItem, null, 2))
    console.log(
      `🎯 Item updated correctly: ${updatedItem?.name === updatedBulkItems[0].name ? 'PASS' : 'FAIL'}`,
    )

    // Verify count (should be 3 - original count, not 5)
    const count = await store.count()
    console.log(`📊 Count after bulk put: ${count}`)
    console.log(`🎯 Count correct: ${count === 3 ? 'PASS' : 'FAIL'}`)

    console.log('✨ bulkPut test completed successfully!\n')
    db.close()
  } catch (error) {
    console.error('❌ bulkPut test failed:', error)
  }
}

async function testBulkDelete() {
  console.log('🗑️📦 Testing bulkDelete function...')
  console.log('=====================================')

  try {
    const db = await createMockDB()
    const store = new TestStore(db)

    await populateTestData(store)

    // Get initial count
    const initialCount = await store.count()
    console.log(`📊 Initial count: ${initialCount}`)

    // Get items to delete
    const allItems = await store.getAll<TestDataWithId>()
    const idsToDelete = allItems.slice(0, 2).map((item) => item.id)
    console.log(`📋 IDs to delete:`, idsToDelete)

    // Bulk delete items
    await store.bulkDelete(idsToDelete)
    console.log(`🗑️ Bulk deleted items with IDs:`, idsToDelete)

    // Verify items were deleted
    const deletedItem1 = await store.get<TestDataWithId>(idsToDelete[0])
    const deletedItem2 = await store.get<TestDataWithId>(idsToDelete[1])
    console.log(`📋 Deleted items result: ${deletedItem1}, ${deletedItem2}`)
    console.log(
      `🎯 Items deleted correctly: ${deletedItem1 === undefined && deletedItem2 === undefined ? 'PASS' : 'FAIL'}`,
    )

    // Verify count decreased
    const countAfterDelete = await store.count()
    console.log(`📊 Count after bulk delete: ${countAfterDelete}`)
    console.log(
      `🎯 Count updated correctly: ${countAfterDelete === initialCount - idsToDelete.length ? 'PASS' : 'FAIL'}`,
    )

    console.log('✨ bulkDelete test completed successfully!\n')
    db.close()
  } catch (error) {
    console.error('❌ bulkDelete test failed:', error)
  }
}

async function testClear() {
  console.log('🧹 Testing clear function...')
  console.log('=====================================')

  try {
    const db = await createMockDB()
    const store = new TestStore(db)

    await populateTestData(store)

    // Get initial count
    const initialCount = await store.count()
    console.log(`📊 Initial count: ${initialCount}`)

    // Clear the store
    await store.clear()
    console.log(`🧹 Store cleared`)

    // Verify store is empty
    const countAfterClear = await store.count()
    console.log(`📊 Count after clear: ${countAfterClear}`)
    console.log(`🎯 Store cleared correctly: ${countAfterClear === 0 ? 'PASS' : 'FAIL'}`)

    // Verify no items remain
    const allItems = await store.getAll<TestDataWithId>()
    console.log(`📊 Items remaining: ${allItems.length}`)
    console.log(`🎯 No items remaining: ${allItems.length === 0 ? 'PASS' : 'FAIL'}`)

    console.log('✨ clear test completed successfully!\n')
    db.close()
  } catch (error) {
    console.error('❌ clear test failed:', error)
  }
}

async function runAllTests() {
  console.log('🚀 Starting BaseStore AsyncGenerator Function Tests')
  console.log('===================================================\n')

  try {
    await cleanupPreviousTestDBs()

    // Basic CRUD tests
    await testCount()
    await testGet()
    await testAdd()
    await testPut()
    await testDelete()
    await testBulkAdd()
    await testBulkPut()
    await testBulkDelete()
    await testClear()

    // Advanced tests
    await testMapAll()
    await testFindAllBy()
    await testTakeByLimit()
    await testReduce()
    await testSlice()
    await testUpdate()
    await testUpdateAll()
    await testUpdateAllByPath()
    await testUpdateByPath()

    console.log('🎉 All tests completed successfully!')
  } catch (error) {
    console.error('💥 Test suite failed:', error)
  }

  console.log('===================================================')
}

export {
  runAllTests,
  testAdd,
  testBulkAdd,
  testBulkDelete,
  testBulkPut,
  testClear,
  testCount,
  testDelete,
  testFindAllBy,
  testGet,
  testMapAll,
  testPut,
  testReduce,
  testSlice,
  testTakeByLimit,
  testUpdate,
  testUpdateAll,
  testUpdateAllByPath,
  testUpdateByPath,
}

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - you can call runAllTests() to execute all tests
  console.log('🌐 Tests ready! Call runAllTests() to execute all tests.')

  interface WindowWithTests extends Window {
    runAllTests: typeof runAllTests
    testCount: typeof testCount
    testGet: typeof testGet
    testAdd: typeof testAdd
    testPut: typeof testPut
    testDelete: typeof testDelete
    testBulkAdd: typeof testBulkAdd
    testBulkPut: typeof testBulkPut
    testBulkDelete: typeof testBulkDelete
    testClear: typeof testClear
    testMapAll: typeof testMapAll
    testFindAllBy: typeof testFindAllBy
    testTakeByLimit: typeof testTakeByLimit
    testReduce: typeof testReduce
    testSlice: typeof testSlice
    testUpdate: typeof testUpdate
    testUpdateAll: typeof testUpdateAll
    testUpdateAllByPath: typeof testUpdateAllByPath
    testUpdateByPath: typeof testUpdateByPath
    cleanupPreviousTestDBs: typeof cleanupPreviousTestDBs
  }

  const windowWithTests = window as unknown as WindowWithTests
  windowWithTests.runAllTests = runAllTests
  windowWithTests.testCount = testCount
  windowWithTests.testGet = testGet
  windowWithTests.testAdd = testAdd
  windowWithTests.testPut = testPut
  windowWithTests.testDelete = testDelete
  windowWithTests.testBulkAdd = testBulkAdd
  windowWithTests.testBulkPut = testBulkPut
  windowWithTests.testBulkDelete = testBulkDelete
  windowWithTests.testClear = testClear
  windowWithTests.testMapAll = testMapAll
  windowWithTests.testFindAllBy = testFindAllBy
  windowWithTests.testTakeByLimit = testTakeByLimit
  windowWithTests.testReduce = testReduce
  windowWithTests.testSlice = testSlice
  windowWithTests.testUpdate = testUpdate
  windowWithTests.testUpdateAll = testUpdateAll
  windowWithTests.testUpdateAllByPath = testUpdateAllByPath
  windowWithTests.testUpdateByPath = testUpdateByPath
  windowWithTests.cleanupPreviousTestDBs = cleanupPreviousTestDBs
}
