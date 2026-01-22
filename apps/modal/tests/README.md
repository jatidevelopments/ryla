# Modal Tests

Test suite for the reorganized Modal codebase.

## Test Files

- `test_imports.py` - Tests that all imports work correctly
- `test_workflow_builders.py` - Tests workflow JSON builders
- `test_image_utils.py` - Tests image processing utilities
- `test_cost_tracker.py` - Tests cost tracking functionality

## Running Tests

```bash
# Run all tests
cd apps/modal
python3 tests/test_imports.py
python3 tests/test_workflow_builders.py
python3 tests/test_image_utils.py
python3 tests/test_cost_tracker.py

# Or run all at once
for test in tests/test_*.py; do
    echo "Running $test..."
    python3 "$test"
done
```

## Test Coverage

- ✅ Module imports
- ✅ Endpoint registration
- ✅ Workflow builders
- ✅ Image utilities
- ✅ Cost tracking

## Future Tests

- Integration tests with actual Modal deployment
- End-to-end tests for each endpoint
- Performance tests
- Error handling tests
