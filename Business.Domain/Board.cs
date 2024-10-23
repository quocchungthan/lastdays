using System;

namespace Business.Domain
{
	public class Board
	{
		public Guid Id { get; set; }

		public string Name { get; set; }

		public EventLog LastEvent { get; set; }

		public EventLog FirstEvent { get; set; }
	}
}
