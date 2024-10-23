using System;

namespace Business.Domain
{
	public class EventLog
	{
		public Guid Id { get; set; }

		public DateTime Timestamp { get; set; } = DateTime.UtcNow;
	}
}
