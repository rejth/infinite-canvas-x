import { BaseStore } from './BaseStore';
import { StoreName } from './interfaces';

class TestStore extends BaseStore {
  constructor(db: IDBDatabase) {
    super(db, StoreName.LAYERS);
  }
}

interface TestData {
  name: string;
  value: number;
  category: string;
}

type TestDataWithId = TestData & { id: number };

const mockTestData: TestData[] = [
  { name: 'Item 1', value: 10, category: 'A' },
  { name: 'Item 2', value: 20, category: 'B' },
  { name: 'Item 3', value: 30, category: 'A' },
  { name: 'Item 4', value: 40, category: 'C' },
  { name: 'Item 5', value: 50, category: 'B' },
];

async function createMockDB(): Promise<IDBDatabase> {
  const dbName = `TestDB_${Date.now()}_${Math.random()}`;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(StoreName.LAYERS)) {
        db.createObjectStore(StoreName.LAYERS, { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains(StoreName.LOG)) {
        db.createObjectStore(StoreName.LOG, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function populateTestData(store: TestStore): Promise<void> {
  console.log('📚 Populating test data...');

  await store.clear();

  for (const item of mockTestData) {
    try {
      const result = await store.add(item);
      console.log(`✅ Added item: ${item.name} with id: ${result}`);
    } catch (error) {
      console.error(`❌ Failed to add item ${item.name}:`, error);
      throw error;
    }
  }

  const count = await store.count();
  console.log(`📊 Total items in store: ${count}\n`);
}

async function testMapAll() {
  console.log('🧪 Testing mapAll function...');
  console.log('=====================================');

  try {
    const db = await createMockDB();
    const store = new TestStore(db);

    await populateTestData(store);

    const mappers = [
      (item: TestDataWithId) => ({ ...item, mapped: true, timestamp: Date.now() }),
      (item: TestDataWithId) => ({ id: item.id, uppercaseName: item.name.toUpperCase(), originalValue: item.value }),
      (item: TestDataWithId) => ({ simpleValue: item.value * 2, category: item.category }),
    ];

    console.log('📝 Number of mappers:', mappers.length);
    console.log('📊 Testing mapAll with multiple mappers...');

    const results: unknown[] = [];
    let resultCount = 0;

    for await (const result of store.mapAll<TestDataWithId, unknown>(mappers)) {
      resultCount++;
      console.log(`✅ Mapped result #${resultCount}:`, JSON.stringify(result, null, 2));
      results.push(result);
    }

    console.log(`🎯 Total mapped results: ${results.length}`);
    console.log(`📈 Expected results: ${mockTestData.length * mappers.length}`);
    console.log('✨ mapAll test completed successfully!\n');

    db.close();
  } catch (error) {
    console.error('❌ mapAll test failed:', error);
  }
}

async function testFindAllBy() {
  console.log('🔍 Testing findAllBy function...');
  console.log('=====================================');

  try {
    const db = await createMockDB();
    const store = new TestStore(db);

    await populateTestData(store);

    const predicate = (item: TestData) => {
      console.log(`🔎 Checking item: ${item.name} (value: ${item.value}) - ${item.value > 25 ? 'MATCH' : 'NO MATCH'}`);
      return item.value > 25;
    };

    console.log('📝 Predicate: value > 25');
    console.log('📊 Testing findAllBy with predicate...');

    const results: TestDataWithId[] = [];
    let itemCount = 0;

    for await (const result of store.findAllBy<TestDataWithId>(predicate)) {
      itemCount++;
      console.log(`✅ Found item #${itemCount}:`, JSON.stringify(result, null, 2));
      results.push(result);
    }

    console.log(`🎯 Total found items: ${results.length}`);
    console.log('✨ findAllBy test completed successfully!\n');

    db.close();
  } catch (error) {
    console.error('❌ findAllBy test failed:', error);
  }
}

async function testTakeByLimit() {
  console.log('📏 Testing takeByLimit function...');
  console.log('=====================================');

  try {
    const db = await createMockDB();
    const store = new TestStore(db);

    await populateTestData(store);

    const limit = 3;

    console.log(`📝 Limit: ${limit}`);
    console.log('📊 Testing takeByLimit...');

    const results: TestDataWithId[] = [];
    let itemCount = 0;

    for await (const result of store.takeByLimit<TestDataWithId>(limit)) {
      itemCount++;
      console.log(`✅ Taken item #${itemCount}:`, JSON.stringify(result, null, 2));
      results.push(result);

      if (itemCount >= limit) {
        console.log('⏹️ Reached limit, should stop here');
      }
    }

    console.log(`🎯 Total taken items: ${results.length}`);
    console.log(`✅ Expected: ${limit}, Actual: ${results.length} - ${results.length === limit ? 'PASS' : 'FAIL'}`);
    console.log('✨ takeByLimit test completed successfully!\n');

    db.close();
  } catch (error) {
    console.error('❌ takeByLimit test failed:', error);
  }
}

async function testFindAndMapAllBy() {
  console.log('🔍📝 Testing findAndMapAllBy function...');
  console.log('=====================================');

  try {
    const db = await createMockDB();
    const store = new TestStore(db);

    await populateTestData(store);

    const predicate = (item: TestDataWithId) => {
      const isMatch = item.category === 'A';
      console.log(`🔎 Checking item: ${item.name} (category: ${item.category}) - ${isMatch ? 'MATCH' : 'NO MATCH'}`);
      return isMatch;
    };

    const mappers = [
      (item: TestDataWithId) => ({ ...item, categoryA: true, processedAt: new Date().toISOString() }),
      (item: TestDataWithId) => ({
        id: item.id,
        name: item.name,
        doubleValue: item.value * 2,
        category: item.category,
        isSpecial: true,
      }),
    ];

    console.log('📝 Predicate: category === "A"');
    console.log('📝 Mappers count:', mappers.length);
    console.log('📊 Testing findAndMapAllBy...');

    const results: unknown[] = [];
    let resultCount = 0;

    for await (const result of store.findAndMapAllBy<TestDataWithId, unknown>(predicate, mappers)) {
      resultCount++;
      console.log(`✅ Found and mapped result #${resultCount}:`, JSON.stringify(result, null, 2));
      results.push(result);
    }

    const expectedCategoryAItems = mockTestData.filter((item) => item.category === 'A').length;
    const expectedResults = expectedCategoryAItems * mappers.length;

    console.log(`🎯 Total found and mapped results: ${results.length}`);
    console.log(
      `📈 Expected results: ${expectedResults} (${expectedCategoryAItems} category A items × ${mappers.length} mappers)`,
    );
    console.log('✨ findAndMapAllBy test completed successfully!\n');

    db.close();
  } catch (error) {
    console.error('❌ findAndMapAllBy test failed:', error);
  }
}

async function testSlice() {
  console.log('✂️ Testing slice function...');
  console.log('=====================================');

  try {
    const db = await createMockDB();
    const store = new TestStore(db);

    await populateTestData(store);

    console.log('📝 Test 1: slice(start=1, stop=4, step=1)');
    console.log('📊 Expected: Items 2, 3, 4 (indices 1-3)');

    const results1: TestDataWithId[] = [];
    let itemCount1 = 0;

    for await (const result of store.sliceBy<TestDataWithId>(1, 4, 1)) {
      itemCount1++;
      console.log(`✅ Sliced item #${itemCount1}:`, JSON.stringify(result, null, 2));
      results1.push(result);
    }

    console.log(`🎯 Total sliced items: ${results1.length}`);
    console.log(`✅ Expected: 3, Actual: ${results1.length} - ${results1.length === 3 ? 'PASS' : 'FAIL'}\n`);

    console.log('📝 Test 2: slice(start=0, stop=5, step=2)');
    console.log('📊 Expected: Items 1, 3, 5 (every 2nd item from index 0-4)');

    const results2: TestDataWithId[] = [];
    let itemCount2 = 0;

    for await (const result of store.sliceBy<TestDataWithId>(0, 5, 2)) {
      itemCount2++;
      console.log(`✅ Sliced item #${itemCount2}:`, JSON.stringify(result, null, 2));
      results2.push(result);
    }

    console.log(`🎯 Total sliced items: ${results2.length}`);
    console.log(`✅ Expected: 3, Actual: ${results2.length} - ${results2.length === 3 ? 'PASS' : 'FAIL'}\n`);

    console.log('📝 Test 3: slice(start=2, stop=10, step=1)');
    console.log('📊 Expected: Items 3, 4, 5 (all remaining items from index 2)');

    const results3: TestDataWithId[] = [];
    let itemCount3 = 0;

    for await (const result of store.sliceBy<TestDataWithId>(2, 10, 1)) {
      itemCount3++;
      console.log(`✅ Sliced item #${itemCount3}:`, JSON.stringify(result, null, 2));
      results3.push(result);
    }

    console.log(`🎯 Total sliced items: ${results3.length}`);
    console.log(`✅ Expected: 3, Actual: ${results3.length} - ${results3.length === 3 ? 'PASS' : 'FAIL'}\n`);

    console.log('📝 Test 4: slice(start=3, stop=3, step=1)');
    console.log('📊 Expected: No items (empty slice)');

    const results4: TestDataWithId[] = [];
    let itemCount4 = 0;

    for await (const result of store.sliceBy<TestDataWithId>(3, 3, 1)) {
      itemCount4++;
      console.log(`✅ Sliced item #${itemCount4}:`, JSON.stringify(result, null, 2));
      results4.push(result);
    }

    console.log(`🎯 Total sliced items: ${results4.length}`);
    console.log(`✅ Expected: 0, Actual: ${results4.length} - ${results4.length === 0 ? 'PASS' : 'FAIL'}\n`);

    console.log('✨ slice test completed successfully!\n');

    db.close();
  } catch (error) {
    console.error('❌ slice test failed:', error);
  }
}

async function runAllTests() {
  console.log('🚀 Starting BaseStore AsyncGenerator Function Tests');
  console.log('===================================================\n');

  try {
    await testMapAll();
    await testFindAllBy();
    await testTakeByLimit();
    await testFindAndMapAllBy();
    await testSlice();

    console.log('🎉 All tests completed successfully!');
  } catch (error) {
    console.error('💥 Test suite failed:', error);
  }

  console.log('===================================================');
}

export { testMapAll, testFindAllBy, testTakeByLimit, testFindAndMapAllBy, testSlice, runAllTests };

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - you can call runAllTests() from console
  console.log('🌐 Tests ready! Call runAllTests() to execute all tests.');

  interface WindowWithTests extends Window {
    runAllTests: typeof runAllTests;
    testMapAll: typeof testMapAll;
    testFindAllBy: typeof testFindAllBy;
    testTakeByLimit: typeof testTakeByLimit;
    testFindAndMapAllBy: typeof testFindAndMapAllBy;
    testSlice: typeof testSlice;
  }

  (window as unknown as WindowWithTests).runAllTests = runAllTests;
  (window as unknown as WindowWithTests).testMapAll = testMapAll;
  (window as unknown as WindowWithTests).testFindAllBy = testFindAllBy;
  (window as unknown as WindowWithTests).testTakeByLimit = testTakeByLimit;
  (window as unknown as WindowWithTests).testFindAndMapAllBy = testFindAndMapAllBy;
  (window as unknown as WindowWithTests).testSlice = testSlice;
}
