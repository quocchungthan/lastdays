using System;

namespace Business.Domain
{
	public class User
	{
		public Guid Id { get; set; }

		public string Name { get; set; }

		public EventLog LastEvent { get; set; }
	}
}
