namespace BetterAttendance.Domain.Shared;

public class Result
{
    protected Result(bool isSuccess, Error error)
    {
        IsSuccess = isSuccess;
        Error = error;
    }

    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public Error Error { get; }

    public static Result Ok() => new(true, Error.None);
    public static Result Fail(Error error) => new(false, error);
    public static Result<T> Ok<T>(T value) => new Result<T>(true, value, Error.None);
    public static Result<T> Fail<T>(Error error) => new Result<T>(false, default, error);
}

public sealed class Result<T> : Result
{
    private readonly T? _value;

    internal Result(bool isSuccess, T? value, Error error) : base(isSuccess, error)
        => _value = value;

    public T Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException("Cannot access Value on a failed Result.");
}
