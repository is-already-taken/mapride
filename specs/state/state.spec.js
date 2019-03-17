
import { StateModule } from "../../src/js/state/state.js";
const State = StateModule.State;

describe("state", () => {
	let state;

	beforeEach(() => {
		spyOn(console, "warn");

		state = State({ foo: 47 });
	});

	it("should initialize the state with the passed data", () => {
		expect(state.state).toEqual({ foo: 47 });
	});

	it("should return an object with subscribe function", () => {
		expect(state.subscribe).toEqual(jasmine.any(Function));
	});

	it("should return an object with the initial state", () => {
		expect(state.state).toEqual({ foo: 47 });
	});

	it("should update the state", (done) => {
		let expectedNewState,
			subscriber = jasmine.createSpy("subscriber");

		state.subscribe(subscriber);

		state.state.foo = 42;

		expectedNewState = { foo: 42 };

		subscriber.and.callFake(() => {
			expect(subscriber)
				.toHaveBeenCalledWith(expectedNewState, expectedNewState);

			done();
		});
	});

	it("should update the state, even if initially undefined", (done) => {
		let expectedNewState,
			subscriber = jasmine.createSpy("subscriber");

		state.subscribe(subscriber);

		state.state.bar = 42;

		expectedNewState = { foo: 47, bar: 42 };

		subscriber.and.callFake(() => {
			expect(subscriber)
				.toHaveBeenCalledWith(expectedNewState, { bar: 42 });

			done();
		});
	});

	it("should log a warning if setting an initially undefined property", (done) => {
		let subscriber = jasmine.createSpy("subscriber");

		state.subscribe(subscriber);

		state.state.bar = 47;

		subscriber.and.callFake(() => {
			expect(console.warn)
				.toHaveBeenCalledWith(
					'Update of undefined property "bar". Consider defining an initial state.'
				);

			done();
		});
	});

	it("should call all subscribers with the change", (done) => {
		let expectedNewState,
			subscriber1 = jasmine.createSpy("subscriber1"),
			subscriber2 = jasmine.createSpy("subscriber2");

		state.subscribe(subscriber1);
		state.subscribe(subscriber2);

		state.state.foo = 42;

		expectedNewState = { foo: 42 };

		subscriber2.and.callFake(() => {
			expect(subscriber1)
				.toHaveBeenCalledWith(expectedNewState, expectedNewState);
			expect(subscriber2)
				.toHaveBeenCalledWith(expectedNewState, expectedNewState);

			done();
		});
	});

	it("should not publish when there's no change", (done) => {
		let subscriber = jasmine.createSpy("subscriber");

		state.subscribe(subscriber);

		state.state.foo = 47;

		// Wait some ticks since the subscribers are informed async
		setTimeout(() => {
			expect(subscriber)
				.not.toHaveBeenCalled();

			done();
		}, 50);
	});

	it("should buffer multiple changes", (done) => {
		let expectedChange,
			expectedNewState,
			subscriber = jasmine.createSpy("subscriber");

		state = State({ foo: 47, bar: 42, baz: 314 });

		state.subscribe(subscriber);

		state.state.foo = 42;
		state.state.bar = 47;

		expectedChange = { foo: 42, bar: 47 };
		expectedNewState = { foo: 42, bar: 47, baz: 314 };

		subscriber.and.callFake(() => {
			expect(subscriber)
				.toHaveBeenCalledWith(expectedNewState, expectedChange);

			done();
		});
	});
});
